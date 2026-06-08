# 全局符号约定

本知识库所有推导页面统一使用以下符号体系。

## 图像与信号

| 符号 | 类型 | 含义 |
|------|------|------|
| $I$ | 标量场 $\mathbb{R}^{H\times W}$ | 输入图像（灰度）或引导图像 |
| $g$ | 标量/向量场 | 引导图像（guidance image） |
| $p$ | 标量场 | 待滤波输入（filter input） |
| $u, S, q$ | 标量场 | 平滑/滤波输出 |
| $p$ | 像素索引 | 像素位置（上下文区分） |
| $N$ | 整数 | 图像总像素数 $H \times W$ |

## 窗口与邻域

| 符号 | 含义 |
|------|------|
| $\omega_k$ | 以像素 $k$ 为中心、半径为 $r$ 的方形窗口 |
| $\|\omega\|$ | 窗口内像素数，$= (2r+1)^2$ |
| $\mathcal{N}(i)$ | 像素 $i$ 的 4-邻域 $\{$上、下、左、右$\}$ |

## 统计量（窗口内）

$$\mu_{I,k} = \frac{1}{|\omega|}\sum_{i\in\omega_k} I_i, \quad \sigma_{I,k}^2 = \frac{1}{|\omega|}\sum_{i\in\omega_k} I_i^2 - \mu_{I,k}^2$$

$$\text{Cov}(I,p)_k = \frac{1}{|\omega|}\sum_{i\in\omega_k} I_i p_i - \mu_{I,k}\mu_{p,k}$$

## 差分算子

| 符号 | 含义 |
|------|------|
| $\partial_x u_i = u_{i+1} - u_i$ | 水平前向差分 |
| $\partial_y u_i = u_{i+W} - u_i$ | 垂直前向差分 |
| $D_x, D_y$ | 对应的矩阵形式（$N\times N$ 稀疏矩阵） |
| $\nabla u = (\partial_x u, \partial_y u)$ | 梯度向量 |

## 傅里叶变换

| 符号 | 含义 |
|------|------|
| $\mathcal{F}(\cdot)$ | 二维离散傅里叶变换（DFT） |
| $\mathcal{F}^{-1}(\cdot)$ | 逆 DFT |
| $\overline{\mathcal{F}(\cdot)}$ | 复共轭 |
| $\odot$ | 逐元素乘法（Hadamard 积） |

**关键性质：** 卷积定理 $\mathcal{F}(A * B) = \mathcal{F}(A) \odot \mathcal{F}(B)$，以及 $\mathcal{F}(D_x u) = \mathcal{F}(d_x) \odot \mathcal{F}(u)$，其中 $d_x$ 是差分滤波核 $[-1, 1]$。

## 正则化参数

| 符号 | 典型范围 | 含义 |
|------|---------|------|
| $\lambda$ | $10^{-4}$ ~ $10^2$ | 平滑强度（越大越平滑） |
| $\epsilon$ | $10^{-6}$ ~ $10^{-2}$ | 数值稳定小常数 |
| $\beta$ | 递增序列 | 半二次分裂惩罚参数 |
| $\kappa$ | $1.5$ ~ $2$ | $\beta$ 的增长率 |

## 优化算子

| 符号 | 含义 |
|------|------|
| $\mathcal{S}_\tau(x) = \text{sign}(x)\max(|x|-\tau, 0)$ | 软阈值算子 |
| $\mathcal{H}_\tau(x) = x \cdot \mathbf{1}[x^2 > \tau]$ | 硬阈值算子（L0 子问题） |
| $\text{prox}_f(v) = \arg\min_x \{f(x) + \frac{1}{2}\|x-v\|^2\}$ | 近端算子 |
