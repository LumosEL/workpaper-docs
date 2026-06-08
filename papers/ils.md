# ILS — 迭代最小二乘实时图像平滑

> **论文：** Real-time Image Smoothing via Iterative Least Squares  
> **作者：** Wei Liu, Pingping Zhang, Xiaolin Huang, Jie Yang, Chunhua Shen, Ian Reid  
> **发表：** ACM TOG 2020, Vol. 39, No. 3  
> **意义：** 加性半二次分裂 + FFT，4 次迭代实现实时（20fps @ 1080p）边缘保持平滑

---

## 1. 广义 Charbonnier 惩罚

ILS 使用广义 Charbonnier 惩罚函数替代 L2 梯度惩罚：

$$\varphi_p(x) = (x^2 + \varepsilon)^{p/2}, \quad 0 < p \leq 1 \tag{1}$$

**性质：**
- $p = 2$：退化为 L2（高斯平滑）
- $p = 1$：Charbonnier 惩罚（近似 L1）
- $p \to 0$：趋近 L0（稀疏梯度）
- $\varepsilon = 0.0001$ — 保证可微性

---

## 2. 能量泛函

$$E(u, f) = \sum_s \left[ (u_s - f_s)^2 + \lambda \sum_{* \in \{x,y\}} \varphi_p(\nabla u_{*,s}) \right] \tag{2}$$

**符号说明：**
- $u$ — 平滑输出
- $f$ — 输入图像
- $s$ — 像素位置
- $\nabla u_{*,s}$ — $u$ 在 $x$ 或 $y$ 方向的梯度
- $\lambda$ — 平滑权重
- $p$ — 范数指数（$0 < p \leq 1$）

---

## 3. 加性半二次分裂（Additive Half-Quadratic Splitting）

### 3.1 关键引理

对于广义 Charbonnier 惩罚 $\varphi_p$，存在常数 $c = p\varepsilon^{p/2-1} > 0$，使得：

$$g(x) = \frac{c}{2}x^2 - \varphi_p(x) \quad \text{是严格凸函数} \tag{3}$$

因此，$\varphi_p$ 可以表示为：

$$\varphi_p(x) = \min_\mu \left\{ \frac{1}{2}\left(\sqrt{c}\,x - \frac{\mu}{\sqrt{c}}\right)^2 + \psi(\mu) \right\} \tag{4}$$

其中 $\psi(\mu)$ 是 $g$ 的 Legendre 变换（凸共轭）。最优 $\mu$ 为：

$$\mu^* = cx - \varphi'_p(x) = cx - p \cdot x \cdot (x^2 + \varepsilon)^{p/2-1} \tag{5}$$

### 3.2 增广能量

将式 (4) 代入式 (2)，引入辅助变量 $\mu_{x,s}$，$\mu_{y,s}$：

$$E_A(u, \mu_x, \mu_y) = \sum_s \left[ (u_s - f_s)^2 + \lambda \sum_{* \in \{x,y\}} \left(\frac{1}{2}\left(\sqrt{c}\nabla u_{*,s} - \frac{\mu_{*,s}}{\sqrt{c}}\right)^2 + \psi(\mu_{*,s})\right) \right] \tag{6}$$

---

## 4. 交替最小化

### 4.1 Step 1：更新 $\mu$（逐像素，无需求解线性系统）

固定 $u$，对每个像素 $s$ 独立最小化：

$$\mu^n_{*,s} = c\nabla u^n_{*,s} - \varphi'_p(\nabla u^n_{*,s}) \tag{7}$$

展开：

$$\mu^n_{*,s} = c\nabla u_{*,s} - p \cdot \nabla u_{*,s} \cdot \left((\nabla u^n_{*,s})^2 + \varepsilon\right)^{p/2-1} \tag{8}$$

**计算量：** 每像素 $O(1)$，全图 $O(N)$。

### 4.2 Step 2：更新 $u$（FFT 闭式解）

固定 $\mu$，对 $u$ 最小化：

$$\min_u \sum_s \left[ (u_s - f_s)^2 + \frac{\lambda c}{2} \sum_{* \in \{x,y\}} \left(\nabla u_{*,s} - \frac{\mu^n_{*,s}}{c}\right)^2 \right] \tag{9}$$

展开并整理（令 $\tilde{\mu}_{*,s} = \mu^n_{*,s}/c$）：

$$\min_u \|u - f\|^2 + \frac{\lambda c}{2}\left[\|D_x u - \tilde{\mu}_x\|^2 + \|D_y u - \tilde{\mu}_y\|^2\right]$$

对 $u$ 求梯度令其为零：

$$\left(2I + \lambda c D_x^T D_x + \lambda c D_y^T D_y\right) u = 2f + \lambda c D_x^T \tilde{\mu}_x + \lambda c D_y^T \tilde{\mu}_y$$

在频域（周期边界条件）：

$$\boxed{u^{n+1} = \mathcal{F}^{-1}\!\left(\frac{2\mathcal{F}(f) + \lambda c\left(\overline{\mathcal{F}(d_x)} \odot \mathcal{F}(\tilde{\mu}_x) + \overline{\mathcal{F}(d_y)} \odot \mathcal{F}(\tilde{\mu}_y)\right)}{2 + \lambda c\left(|\mathcal{F}(d_x)|^2 + |\mathcal{F}(d_y)|^2\right)}\right)} \tag{10}$$

**关键优化：** 分母 $2 + \lambda c(|\mathcal{F}(d_x)|^2 + |\mathcal{F}(d_y)|^2)$ 与迭代无关，**预计算一次**即可。每次迭代只需：
1. 计算 $\mathcal{F}(\tilde{\mu}_x)$，$\mathcal{F}(\tilde{\mu}_y)$（2 次 FFT）
2. 逐元素乘除（$O(N)$）
3. 1 次 IFFT

---

## 5. 完整算法

```
输入：图像 f，参数 p，λ，N=4 次迭代
初始化：u⁰ ← f

预计算：
  c = p · ε^(p/2 - 1)
  F_f = FFT(f)
  F_dx = FFT(d_x)，F_dy = FFT(d_y)
  denom = 2 + λc·(|F_dx|² + |F_dy|²)   // 预计算，不变

for n = 0 to N-1:
  // Step 1：更新 μ（式 8，逐像素）
  grad_x = diff_x(u^n)，grad_y = diff_y(u^n)
  μ_x = c·grad_x - p·grad_x·(grad_x² + ε)^(p/2-1)
  μ_y = c·grad_y - p·grad_y·(grad_y² + ε)^(p/2-1)

  // Step 2：更新 u（式 10，FFT）
  μ̃_x = μ_x / c，μ̃_y = μ_y / c
  numer = 2·F_f + λc·(conj(F_dx)·FFT(μ̃_x) + conj(F_dy)·FFT(μ̃_y))
  u^(n+1) = IFFT(numer / denom).real

输出：u^N
```

---

## 6. GPU 加速

ILS 的每步操作（逐像素更新 + FFT）均高度并行，适合 GPU 加速：
- 使用 cuFFT 进行批量 FFT
- 实测：**20fps @ 1080p**（NVIDIA GTX 1080）

---

## 7. 参数选择

| 参数 | 典型值 | 效果 |
|------|--------|------|
| $p$ | $0.5$ ~ $1.0$ | 越小越接近 L0，边缘越锐利 |
| $\lambda$ | $0.01$ ~ $0.1$ | 平滑强度 |
| $N$ | $4$ | 迭代次数（4 次已达 74~90% 能量下降） |
| $\varepsilon$ | $0.0001$ | Charbonnier 平滑参数 |
