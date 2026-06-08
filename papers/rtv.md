# RTV — 相对全变分结构提取

> **论文：** Structure Extraction from Texture via Relative Total Variation  
> **作者：** Li Xu, Qiong Yan, Yang Xia, Jiaya Jia  
> **发表：** ACM SIGGRAPH Asia 2012, TOG Vol. 31, No. 6  
> **意义：** 提出"相对全变分"概念，通过 WTV/WIV 之比区分结构与纹理

---

## 1. 核心问题：结构 vs 纹理

**挑战：** 结构（structure）和纹理（texture）都有梯度，传统 TV 无法区分。

**关键观察：**
- **结构边缘**：梯度在局部区域内方向一致（相干性高）
- **纹理**：梯度在局部区域内方向随机（相干性低）

RTV 利用这一观察，定义**窗口全变分（WTV）**和**窗口固有变分（WIV）**，用其比值（相对全变分）作为正则项。

---

## 2. 核心定义

### 2.1 窗口全变分（Windowed Total Variation, WTV）

$$D_x(p) = \sum_{q \in R(p)} g_{p,q} \cdot |(\partial_x S)_q|, \quad D_y(p) = \sum_{q \in R(p)} g_{p,q} \cdot |(\partial_y S)_q| \tag{1}$$

WTV 是局部区域内梯度绝对值的加权和，对结构和纹理都大。

### 2.2 窗口固有变分（Windowed Inherent Variation, WIV）

$$L_x(p) = \left|\sum_{q \in R(p)} g_{p,q} \cdot (\partial_x S)_q\right|, \quad L_y(p) = \left|\sum_{q \in R(p)} g_{p,q} \cdot (\partial_y S)_q\right| \tag{2}$$

WIV 是局部区域内梯度的加权和的绝对值（先求和再取绝对值）。

**关键区别：**
- **结构边缘**：局部梯度方向一致，$|{\sum g \cdot \partial_x S}| \approx \sum g \cdot |\partial_x S|$，故 $L_x \approx D_x$（比值 $\approx 1$）
- **纹理**：局部梯度方向随机，正负相消，$|\sum g \cdot \partial_x S| \ll \sum g \cdot |\partial_x S|$，故 $L_x \ll D_x$（比值 $\ll 1$）

### 2.3 高斯空间亲和权重

$$g_{p,q} \propto \exp\!\left(-\frac{(x_p-x_q)^2+(y_p-y_q)^2}{2\sigma^2}\right) \tag{3}$$

$\sigma$ 控制局部窗口的空间范围（典型值 $\sigma = 3$）。

---

## 3. 能量泛函

$$\arg\min_S \; \sum_p (S_p - I_p)^2 + \lambda \sum_p \left(\frac{D_x(p)}{L_x(p) + \varepsilon} + \frac{D_y(p)}{L_y(p) + \varepsilon}\right) \tag{4}$$

**各项含义：**
- $(S_p - I_p)^2$ — 数据保真项
- $D_x(p) / (L_x(p) + \varepsilon)$ — 相对全变分（RTV）正则项
  - 纹理处：$D_x$ 大，$L_x$ 小 $\Rightarrow$ 比值大 $\Rightarrow$ 被强烈惩罚（纹理被去除）
  - 结构处：$D_x \approx L_x$ $\Rightarrow$ 比值 $\approx 1$ $\Rightarrow$ 惩罚小（结构被保留）
- $\varepsilon = 10^{-3}$ — 防止除零

---

## 4. 迭代重加权最小二乘（IRLS）求解

式 (4) 是非线性优化问题，通过 IRLS 将其线性化。

### 4.1 分解 RTV 正则项

将 $D_x(p) / (L_x(p) + \varepsilon)$ 分解为两个权重的乘积：

$$\frac{D_x(p)}{L_x(p)+\varepsilon} = \sum_q g_{p,q} \cdot \frac{|(\partial_x S)_q|}{L_x(p)+\varepsilon}$$

引入两个辅助权重：

$$u_{x,q} = \left(G_\sigma * \frac{1}{|G_\sigma * \partial_x S| + \varepsilon}\right)_q \tag{5}$$

$$w_{x,q} = \frac{1}{|(\partial_x S)_q| + \varepsilon_s} \tag{6}$$

其中 $G_\sigma * (\cdot)$ 表示高斯卷积（对应 WIV 的分母），$\varepsilon_s = 2\times10^{-2}$。

则 RTV 正则项近似为：

$$\sum_p \frac{D_x(p)}{L_x(p)+\varepsilon} \approx \sum_q u_{x,q} \cdot w_{x,q} \cdot (\partial_x S)_q^2 \tag{7}$$

类似地定义 $u_{y,q}$，$w_{y,q}$。

### 4.2 矩阵形式

$$E(S) \approx \|S - I\|^2 + \lambda \left[S^T C_x^T U_x W_x C_x S + S^T C_y^T U_y W_y C_y S\right] \tag{8}$$

其中 $C_x = D_x$（差分矩阵），$U_x = \text{diag}(u_{x,q})$，$W_x = \text{diag}(w_{x,q})$。

定义迭代 Laplacian：

$$L_t = C_x^T U_x^t W_x^t C_x + C_y^T U_y^t W_y^t C_y \tag{9}$$

### 4.3 线性系统

对 $S$ 求梯度并令其为零：

$$\boxed{(I + \lambda L_t) S^{t+1} = I} \tag{10}$$

---

## 5. 完整算法

```
输入：图像 I，参数 σ，λ，ε = 1e-3，εs = 2e-2
初始化：S⁰ ← I

for t = 0, 1, 2:
  // 计算梯度
  grad_x = diff_x(S^t)，grad_y = diff_y(S^t)

  // 计算 WIV 相关权重（式 5）
  u_x = Gaussian_conv(1 / (|Gaussian_conv(grad_x)| + ε), σ)
  u_y = Gaussian_conv(1 / (|Gaussian_conv(grad_y)| + ε), σ)

  // 计算 WTV 相关权重（式 6）
  w_x = 1 / (|grad_x| + εs)
  w_y = 1 / (|grad_y| + εs)

  // 构建 Laplacian L_t（式 9）
  // 求解线性系统（式 10）
  S^(t+1) = solve((I + λ·L_t) · S = I)

输出：S^3
```

**迭代次数：** 3~5 次即可收敛。

---

## 6. 参数选择

| 参数 | 典型值 | 作用 |
|------|--------|------|
| $\lambda$ | $0.001$ ~ $0.01$ | 结构/纹理分离强度 |
| $\sigma$ | $3$ | 局部窗口大小 |
| $\varepsilon$ | $10^{-3}$ | WIV 分母稳定性 |
| $\varepsilon_s$ | $2\times10^{-2}$ | WTV 权重稳定性 |

---

## 7. 与 L0 Smoothing 的比较

| 特性 | L0 Smoothing | RTV |
|------|-------------|-----|
| 正则项 | L0 梯度计数 | 相对全变分（WTV/WIV） |
| 纹理去除 | 按梯度幅值阈值 | 按梯度相干性 |
| 结构保持 | 强边缘 | 相干边缘（含弱结构） |
| 求解 | 半二次分裂 + FFT | IRLS + 线性系统 |
| 迭代次数 | 20~30 | 3~5 |
