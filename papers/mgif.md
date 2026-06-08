# MGIF — 互引导图像滤波

> **论文：** Mutually Guided Image Filtering  
> **作者：** Xiaoyong Shen, Li Xu, Qi Zhang, Jiaya Jia  
> **发表：** IEEE TPAMI 2020  
> **意义：** 两幅图像通过相对结构互相引导，解决单向引导中的结构不匹配问题

---

## 1. 问题背景

传统引导滤波（GIF）使用固定的引导图像 $g$ 来滤波输入 $p$。当 $g$ 和 $p$ 来自不同模态（如 RGB 和深度图）时，$g$ 中的结构可能与 $p$ 中的结构不对齐，导致**纹理复制（texture copying）**问题。

MGIF 的解决方案：**让两幅图像通过相对结构互相引导**，通过交替迭代使两者的结构逐渐对齐。

---

## 2. 相对结构

定义图像 $T$ 相对于 $R$ 的**相对结构**（Relative Structure）：

$$\mathcal{R}(T, R) = \sum_i \sum_{d \in \{h,v\}} \frac{|\nabla_d T_i|}{|\nabla_d R_i|} \tag{1}$$

**直觉：**
- 若 $T$ 和 $R$ 的梯度方向一致（结构对齐），则 $|\nabla T| / |\nabla R|$ 接近常数，$\mathcal{R}$ 较小
- 若 $T$ 有 $R$ 没有的结构（纹理复制），则 $|\nabla T| / |\nabla R|$ 很大，$\mathcal{R}$ 很大

---

## 3. 联合优化目标

$$\arg\min_{T,R} \; \alpha_t \mathcal{R}(T, R) + \beta_t \|T - T_0\|_2^2 + \alpha_r \mathcal{R}(R, T) + \beta_r \|R - R_0\|_2^2 \tag{2}$$

**符号说明：**
- $T_0, R_0$ — 两幅输入图像
- $T, R$ — 两幅滤波输出图像
- $\alpha_t, \alpha_r$ — 相对结构正则化权重
- $\beta_t, \beta_r$ — 数据保真权重

---

## 4. 数值稳定化

为防止除零，引入稳定化的相对结构：

$$\mathcal{R}(T, R; \rho) = \sum_i \sum_{d} \frac{|\nabla_d T_i|}{\max(|\nabla_d R_i|, \rho)} \tag{3}$$

其中 $\rho > 0$ 是小常数（典型值 $\rho = 0.01$）。

---

## 5. 代理函数（Surrogate）

直接优化式 (2) 困难，通过**主化-最小化（MM）**构造代理函数。对 $|\nabla_d T_i| / \max(|\nabla_d R_i|, \rho)$ 构造上界：

$$\frac{|\nabla_d T_i|}{\max(|\nabla_d R_i|, \rho)} \leq \frac{(\nabla_d T_i)^2}{2 \max(|\nabla_d R_i|, \rho) \max(|\nabla_d T_i^{(k)}|, \tau)} + \text{const} \tag{4}$$

其中 $\tau \to 0^+$，等号在 $|\nabla_d T_i| = |\nabla_d T_i^{(k)}|$ 时成立。

---

## 6. 交替最小化（ALS）

### 6.1 矩阵形式

代理目标写成矩阵形式：

$$\arg\min_{t,r} \; \alpha_t \, t^T \!\left(\sum_d D_d^T Q_d^{(k)} P_d^{(k)} D_d\right) t + \beta_t \|t - t_0\|^2 + \alpha_r \, r^T \!\left(\sum_d D_d^T Q_d^{(k)} P_d^{(k)} D_d\right) r + \beta_r \|r - r_0\|^2 \tag{5}$$

其中 $D_d$ 是方向 $d$ 的差分矩阵，$Q_d, P_d$ 是对角矩阵：

$$Q_d[i,i] = \frac{1}{\max(|\nabla_d T_i^{(k)}|, \tau)}, \quad P_d[i,i] = \frac{1}{\max(|\nabla_d R_i^{(k)}|, \rho)} \tag{6}$$

### 6.2 $T$ 子问题（固定 $R$）

$$\left[I + \frac{\alpha_t}{\beta_t} \sum_d D_d^T Q_d^{(k)} P_d^{(k)} D_d\right] t = t_0 \tag{7}$$

### 6.3 $R$ 子问题（固定 $T$）

$$\left[I + \frac{\alpha_r}{\beta_r} \sum_d D_d^T Q_d^{(k+1)} P_d^{(k)} D_d\right] r = r_0 \tag{8}$$

两个子问题均为**稀疏对称正定线性系统**，可用 PCG 高效求解。

---

## 7. 三种工作模式

| 模式 | 描述 | 对应目标 |
|------|------|---------|
| **Dynamic/Dynamic** | 两幅图像互相引导（完整 MGIF） | 式 (2) |
| **Static/Dynamic** | 固定参考图像引导目标图像 | $\alpha_t \mathcal{R}(T, R_0) + \beta_t\|T-T_0\|^2$ |
| **Dynamic Only** | 自引导（等价于最小化 $\sum \log|\nabla T|$） | $\alpha_t \mathcal{R}(T, T) + \beta_t\|T-T_0\|^2$ |

---

## 8. 应用场景

- **深度图超分辨率**：RGB 图像和低分辨率深度图互相引导
- **闪光/非闪光图像融合**：两种曝光图像互相引导
- **多模态图像融合**：红外图像和可见光图像互相引导
