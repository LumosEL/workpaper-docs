# L-Gradient — 卡通纹理分解

> **论文：** L0Gradient-Regularization and Scale Space Representation Model for Cartoon and Texture Decomposition  
> **发表：** IEEE TIP 2024  
> **意义：** 提出L0梯度正则化，结合尺度空间表示实现卡通/纹理分解

---

## 1. 核心能量泛函

$$\min_{u, v} \; \|u + v - f\|^2 + \lambda_1 R_{\text{cartoon}}(u) + \lambda_2 R_{\text{texture}}(v) \tag{1}$$

其中：
- $u$ — 卡通层（分段平滑，包含主要结构）
- $v$ — 纹理层（振荡，包含细节纹理）
- $f$ — 输入图像

---

## 2. L-梯度正则化

**卡通层正则化（L-梯度）：**

$$R_{\text{cartoon}}(u) = \sum_i \phi_L(\|\nabla u_i\|) \tag{2}$$

其中 $\phi_L$ 是 L 形惩罚函数：

$$\phi_L(x) = \begin{cases} x^2 & x \leq \tau \\ 2\tau x - \tau^2 & x > \tau \end{cases} \tag{3}$$

（Huber 函数的变体，在 $x = \tau$ 处从 L2 切换到 L1）

**纹理层正则化：**

$$R_{\text{texture}}(v) = \|v\|_{G^{-1}}^2 = v^T G^{-1} v \tag{4}$$

其中 $G$ 是高斯卷积算子（纹理层应具有振荡特性，用 $G^{-1}$ 惩罚低频分量）。

---

## 3. 尺度空间表示

在不同尺度 $\sigma$ 下分解：

$$u^{(\sigma)} = \arg\min_u \|u - f\|^2 + \lambda \sum_i \phi_L(\|\nabla u_i\|; \sigma) \tag{5}$$

其中阈值 $\tau$ 随尺度 $\sigma$ 变化，实现多尺度的卡通/纹理分离。

---

## 4. 求解方法

使用 ADMM（交替方向乘子法）：

**$u$-子问题：** 线性系统（可用 FFT 或 PCG 求解）

**$v$-子问题：** 近端算子（软阈值或 Huber 阈值）

**对偶变量更新：** 标准 ADMM 步骤
