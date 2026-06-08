# FGS — 快速全局图像平滑

> **论文：** Fast Global Image Smoothing Based on Weighted Least Squares  
> **作者：** Dongbo Min, Sunghwan Choi, Jiangbo Lu, Bumsub Ham, Kwanghoon Sohn, Minh N. Do  
> **发表：** IEEE TIP 2014, Vol. 23, No. 12  
> **意义：** 将 2D WLS 分解为可分离的 1D 三对角系统，实现 $O(N)$ 实时求解

---

## 1. 核心问题

WLS 的线性系统 $(I + \lambda L_g)u = f$ 虽然稀疏，但 2D 情况下直接求解仍需 $O(N^{1.5})$ 或更高复杂度。FGS 的核心贡献是将 2D 问题**近似分解**为一系列 1D 三对角系统，每个系统可在 $O(N)$ 内用 Thomas 算法精确求解。

---

## 2. WLS 能量泛函

$$J(u) = \sum_p \left[ (u_p - f_p)^2 + \lambda \sum_{q \in N(p)} w_{p,q}(g)(u_p - u_q)^2 \right] \tag{1}$$

**引导权重：**

$$w_{p,q}(g) = \exp\!\left(-\frac{\|g_p - g_q\|_1}{\sigma_c}\right) \tag{2}$$

其中 $\sigma_c$ 是范围参数（控制边缘敏感度）。

**矩阵形式：** $(I + \lambda A)u = f$，其中 $A$ 是加权图 Laplacian。

---

## 3. 可分离近似：1D 三对角分解

### 3.1 水平方向 1D 子问题

对每一行 $h$，定义 1D 水平平滑问题：

$$J^h(u^h) = \sum_x \left[ (u^h_x - f^h_x)^2 + \lambda_t \sum_{i \in N^h(x)} w_{x,i}(g^h)(u^h_x - u^h_i)^2 \right] \tag{3}$$

其中 $N^h(x) = \{x-1, x+1\}$（1D 邻域）。

对 $u^h_x$ 求偏导并令其为零，得到**三对角线性系统**：

$$a_x u^h_{x-1} + b_x u^h_x + c_x u^h_{x+1} = f^h_x \tag{4}$$

其中：
$$a_x = -\lambda_t w_{x,x-1}, \quad c_x = -\lambda_t w_{x,x+1}$$
$$b_x = 1 + \lambda_t(w_{x,x-1} + w_{x,x+1})$$

### 3.2 Thomas 算法（$O(N)$ 三对角求解）

三对角系统 $Au = f$ 可用 Thomas 算法（高斯消元的特殊形式）在 $O(N)$ 内精确求解：

**前向消元：**
$$c'_x = \frac{c_x}{b_x - a_x c'_{x-1}}, \quad f'_x = \frac{f_x - a_x f'_{x-1}}{b_x - a_x c'_{x-1}}$$

**后向代入：**
$$u^h_x = f'_x - c'_x u^h_{x+1}$$

### 3.3 垂直方向类似处理

对每一列 $v$ 定义类似的 1D 垂直平滑问题，同样得到三对角系统。

---

## 4. 迭代可分离近似

单次水平+垂直扫描不等价于 2D WLS，但**多次交替迭代**可以收敛到近似解。

FGS 使用 $T = 3$ 次迭代，每次迭代的 $\lambda_t$ 按以下方式递减：

$$\lambda_t = \frac{3}{2} \cdot \frac{4^{T-t}}{4^T - 1} \cdot \lambda, \quad t = 1, 2, \ldots, T \tag{5}$$

**推导：** 1D 平滑器的脉冲响应为 $r(x) = \frac{1}{2\sqrt{\lambda_t}}\exp(-|x|/\sqrt{\lambda_t})$，其方差为 $2\lambda_t$。要求各次迭代的方差之和等于目标方差 $\lambda$（**方差匹配条件**）：

$$\sum_{t=1}^T 2\lambda_t = \lambda$$

且 $\lambda_t$ 按等比数列递减（比率 $1/4$）：

$$\lambda_1 : \lambda_2 : \lambda_3 = 16 : 4 : 1$$

由 $2(\lambda_1 + \lambda_2 + \lambda_3) = \lambda$，即 $\lambda_1 + \lambda_2 + \lambda_3 = \lambda/2$，得：

$$\lambda_1 = \frac{16}{21} \cdot \frac{\lambda}{2} = \frac{8}{21}\lambda, \quad \lambda_2 = \frac{4}{21} \cdot \frac{\lambda}{2} = \frac{2}{21}\lambda, \quad \lambda_3 = \frac{1}{21} \cdot \frac{\lambda}{2} = \frac{1}{42}\lambda$$

---

## 5. 完整算法

```
输入：输入图像 f，引导图像 g，参数 λ，σ_c，T=3
输出：平滑结果 u

// 预计算引导权重
w_h[x] = exp(-|g[x] - g[x+1]| / σ_c)  // 水平权重
w_v[y] = exp(-|g[y] - g[y+W]| / σ_c)  // 垂直权重

u ← f
for t = 1 to T:
  λ_t = (3/2) · 4^(T-t) / (4^T - 1) · λ

  // 水平扫描（逐行求解三对角系统）
  for each row h:
    构建三对角系统（式 4）
    用 Thomas 算法求解 u^h

  // 垂直扫描（逐列求解三对角系统）
  for each column v:
    构建三对角系统（类似式 4）
    用 Thomas 算法求解 u^v

输出：u
```

**复杂度：** $O(TN)$，每次迭代 $O(N)$，$T=3$ 次共 $O(N)$。

---

## 6. 扩展：$L^\gamma$ 范数（IRLS）

FGS 可扩展到 $L^\gamma$ 范数（$0 < \gamma \leq 2$）：

$$J_\gamma(u) = \sum_p \left[ (u_p - f_p)^2 + \lambda \sum_{q \in N(p)} w_{p,q}(g)|u_p - u_q|^\gamma \right] \tag{6}$$

通过 IRLS（迭代重加权最小二乘）求解：在第 $k$ 次外迭代中，用当前解 $u^{(k)}$ 更新权重：

$$\phi_{p,q}^{(k)} = w_{p,q}(g) \cdot \frac{1}{|u^{(k)}_p - u^{(k)}_q|^{2-\gamma} + \kappa} \tag{7}$$

然后求解加权 WLS 问题（用 FGS 的三对角方法）。

---

## 7. 性能对比

| 方法 | 复杂度 | 1MP 图像时间 |
|------|--------|------------|
| WLS (PCG) | $O(N)$ | ~3.5s |
| **FGS** | **$O(N)$** | **~0.1s** |
| 双边滤波 | $O(N)$ | ~0.05s |
| GIF | $O(N)$ | ~0.02s |

FGS 比 WLS 快约 30~50 倍，同时保持相近的平滑质量。
