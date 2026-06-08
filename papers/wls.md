# WLS — 边缘保持多尺度分解

> **论文：** Edge-Preserving Decompositions for Multi-Scale Tone and Detail Manipulation  
> **作者：** Zeev Farbman, Raanan Fattal, Dani Lischinski, Richard Szeliski  
> **发表：** ACM SIGGRAPH 2008, TOG Vol. 27, No. 3  
> **意义：** 加权最小二乘（WLS）框架的奠基之作，引入空间变化的平滑权重实现边缘保持

---

## 1. 核心思想

WLS 滤波器的目标：**在保持图像边缘的同时，对平坦区域进行强平滑**。

关键创新：平滑权重 $a_{x,p}$ 和 $a_{y,p}$ 由输入图像的梯度决定——梯度大的地方（边缘）权重小（不平滑），梯度小的地方（平坦区域）权重大（强平滑）。

---

## 2. 能量泛函

$$\min_u \; \sum_p \left[ \underbrace{(u_p - g_p)^2}_{\text{数据保真}} + \lambda \left( \underbrace{a_{x,p}(g)\left(\frac{\partial u}{\partial x}\right)_p^2 + a_{y,p}(g)\left(\frac{\partial u}{\partial y}\right)_p^2}_{\text{加权平滑项}} \right) \right] \tag{1}$$

**符号说明：**
- $u$ — 平滑输出图像
- $g$ — 输入图像（同时作为引导）
- $\lambda$ — 平滑强度（越大越平滑）
- $a_{x,p}(g), a_{y,p}(g)$ — 空间变化的平滑权重，由 $g$ 的梯度决定
- $\frac{\partial u}{\partial x}, \frac{\partial u}{\partial y}$ — 输出图像的水平/垂直梯度

---

## 3. 平滑权重设计

$$a_{x,p}(g) = \left(\left|\frac{\partial \ell}{\partial x}(p)\right|^\alpha + \varepsilon\right)^{-1} \tag{2}$$

$$a_{y,p}(g) = \left(\left|\frac{\partial \ell}{\partial y}(p)\right|^\alpha + \varepsilon\right)^{-1} \tag{3}$$

其中：
- $\ell = \log(g + 1)$ — 输入图像的对数亮度（log-luminance），对高动态范围图像更鲁棒
- $\alpha \in [1.2, 2.0]$ — 梯度敏感度指数，控制边缘保持的锐利程度
- $\varepsilon \approx 0.0001$ — 防止除零的小常数

**直觉：**
- 在边缘处：$|\partial_x \ell|$ 大 $\Rightarrow$ $a_{x,p}$ 小 $\Rightarrow$ 该方向不平滑（保留边缘）
- 在平坦区域：$|\partial_x \ell| \approx 0$ $\Rightarrow$ $a_{x,p} \approx 1/\varepsilon$ 大 $\Rightarrow$ 强平滑

---

## 4. 矩阵形式与线性系统

将式 (1) 写成矩阵形式。设 $u, g$ 为 $N$-维列向量，$D_x, D_y$ 为 $N\times N$ 前向差分矩阵，$A_x = \text{diag}(a_{x,p})$，$A_y = \text{diag}(a_{y,p})$：

$$E(u) = (u-g)^T(u-g) + \lambda\left[u^T D_x^T A_x D_x u + u^T D_y^T A_y D_y u\right] \tag{4}$$

定义**空间非均匀 Laplacian**：

$$L_g = D_x^T A_x D_x + D_y^T A_y D_y \tag{5}$$

则 $E(u) = (u-g)^T(u-g) + \lambda \, u^T L_g u$。

### 4.1 求解线性系统

对 $u$ 求梯度并令其为零：

$$\frac{\partial E}{\partial u} = 2(u - g) + 2\lambda L_g u = 0$$

$$\boxed{(I + \lambda L_g) u = g} \tag{6}$$

这是一个**稀疏对称正定线性系统**，可用预条件共轭梯度（PCG）高效求解。

### 4.2 矩阵 $L_g$ 的稀疏结构

$L_g$ 是 $N\times N$ 的稀疏矩阵，每行最多 5 个非零元素（对应像素 $p$ 及其 4 个邻居）：

$$[L_g]_{pp} = a_{x,p} + a_{x,p-1} + a_{y,p} + a_{y,p-W}$$

$$[L_g]_{p,p+1} = -a_{x,p}, \quad [L_g]_{p,p-1} = -a_{x,p-1}$$

$$[L_g]_{p,p+W} = -a_{y,p}, \quad [L_g]_{p,p-W} = -a_{y,p-W}$$

---

## 5. 多尺度分解

WLS 的核心应用是构建**边缘保持的多尺度分解**，类似于拉普拉斯金字塔但不模糊边缘。

### 5.1 非迭代分解

定义 WLS 滤波器 $F_\lambda(g) = (I + \lambda L_g)^{-1} g$，则：

$$b_k = F_{\lambda_k}(g), \quad \lambda_k = c^k \lambda_0 \quad (k = 0, 1, 2, \ldots) \tag{7}$$

$$d_k = b_{k-1} - b_k \quad \text{（第 $k$ 层细节）} \tag{8}$$

其中 $b_{-1} = g$（原始图像），$c > 1$ 是尺度增长因子（典型值 $c = 4$）。

### 5.2 迭代分解

$$b_k = F_{\lambda_k}(b_{k-1}) \tag{9}$$

迭代分解在每层使用前一层的输出作为输入，产生更平滑的基础层。

---

## 6. 频域分析（均匀权重特例）

当 $a_x = a_y = a$（常数，即均匀权重）时，$L_g$ 退化为标准 Laplacian，系统 (6) 在频域有解析解：

$$\hat{u}(\omega_x, \omega_y) = \frac{\hat{g}(\omega_x, \omega_y)}{1 + 4\lambda a \left(\sin^2\frac{\omega_x}{2} + \sin^2\frac{\omega_y}{2}\right)} \tag{10}$$

这是一个**低通滤波器**，截止频率由 $\lambda a$ 控制。当 $\lambda a \to \infty$ 时，所有频率分量被抑制（完全平滑）。

---

## 7. 与高斯滤波的对比

| 特性 | 高斯滤波 | WLS |
|------|---------|-----|
| 权重 | 空间固定 | 空间变化（依赖梯度） |
| 边缘 | 模糊 | 保持 |
| 光晕 | 无 | 无（全局优化） |
| 复杂度 | $O(N)$ | $O(N)$（PCG + 多分辨率） |
| 多尺度 | 高斯金字塔 | 边缘保持金字塔 |

---

## 8. 算法复杂度

- 构建 $L_g$：$O(N)$
- PCG 求解 $(I + \lambda L_g)u = g$：$O(N)$（使用多分辨率预条件子）
- 实测：约 3.5 秒/百万像素（2.2 GHz Core 2 Duo，2008年）

---

## 9. 参数选择

| 参数 | 典型值 | 效果 |
|------|--------|------|
| $\lambda$ | $0.125$ ~ $8$ | 平滑强度 |
| $\alpha$ | $1.2$ ~ $2.0$ | 边缘锐利度（越大越锐利） |
| $\varepsilon$ | $0.0001$ | 数值稳定性 |
| $c$ | $4$ | 多尺度分解的尺度比 |
