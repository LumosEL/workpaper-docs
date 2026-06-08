# TDS — 纹理细节分离算法

> **论文：** The Applications and Properties of the TDS Algorithm  
> **发表：** IEEE TNNLS 2026  
> **意义：** 系统分析 TDS（Texture-Detail Separation）算法的性质与应用

---

## 1. 核心能量泛函

TDS 算法的目标是将图像分解为结构层 $u$ 和纹理/细节层 $f - u$：

$$E(\mathbf{u}) = \|\mathbf{u} - \mathbf{f}\|^2 + \lambda \sum_{i} \phi(\|\nabla u_i\|) \tag{1}$$

TDS 特定形式使用输入图像梯度作为自适应权重：

$$E(\mathbf{u}) = \|\mathbf{u} - \mathbf{f}\|^2 + \lambda \sum_{i} \left[\frac{(\partial_x u_i)^2}{|\partial_x f_i|^2 + \epsilon} + \frac{(\partial_y u_i)^2}{|\partial_y f_i|^2 + \epsilon}\right] \tag{2}$$

**符号说明：**
- $\mathbf{u}$ — 平滑输出（结构层）
- $\mathbf{f}$ — 输入图像
- $\lambda$ — 正则化权重
- $\epsilon$ — 数值稳定小常数
- $\partial_x f_i, \partial_y f_i$ — 输入图像的梯度（固定，作为权重）

---

## 2. 矩阵形式与线性系统

式 (2) 是关于 $\mathbf{u}$ 的二次函数，直接求解：

$$\frac{\partial E}{\partial \mathbf{u}} = 2(\mathbf{u} - \mathbf{f}) + 2\lambda \mathbf{L}_f \mathbf{u} = 0$$

$$\boxed{(\mathbf{I} + \lambda \mathbf{L}_f) \mathbf{u} = \mathbf{f}} \tag{3}$$

其中加权 Laplacian：

$$\mathbf{L}_f = \mathbf{D}_x^T \mathbf{C}_x \mathbf{D}_x + \mathbf{D}_y^T \mathbf{C}_y \mathbf{D}_y$$

$$C_{x,ii} = \frac{1}{|\partial_x f_i|^2 + \epsilon}, \quad C_{y,ii} = \frac{1}{|\partial_y f_i|^2 + \epsilon}$$

---

## 3. 半二次分裂求解（用于非线性扩展）

当 $\phi$ 为非二次函数时，引入辅助变量 $\mathbf{v} = \nabla \mathbf{u}$：

$$E_\mu(\mathbf{u}, \mathbf{v}) = \|\mathbf{u} - \mathbf{f}\|^2 + \lambda \sum_i \phi(v_i) + \frac{\mu}{2}\|\nabla \mathbf{u} - \mathbf{v}\|^2 \tag{4}$$

**$\mathbf{u}$-子问题**（FFT 可解）：

$$(\mathbf{I} + \mu \nabla^T \nabla)\mathbf{u} = \mathbf{f} + \mu \nabla^T \mathbf{v}$$

频域解：

$$\hat{u} = \frac{\hat{f} + \mu(\overline{\hat{d}_x} \odot \hat{v}_x + \overline{\hat{d}_y} \odot \hat{v}_y)}{1 + \mu(|\hat{d}_x|^2 + |\hat{d}_y|^2)} \tag{5}$$

**$\mathbf{v}$-子问题**（逐像素软阈值）：

$$v_i^* = \mathcal{S}_{\lambda/\mu}(\nabla u_i) \tag{6}$$

其中 $\mathcal{S}_\tau(x) = \text{sign}(x)\max(|x|-\tau, 0)$ 是软阈值算子。

---

## 4. TDS 的关键性质

1. **线性性**：当权重固定时，TDS 是线性滤波器
2. **边缘保持**：权重 $1/(|\partial f|^2 + \epsilon)$ 在边缘处小，减少跨边缘平滑
3. **自适应性**：权重由输入图像自身决定，无需额外引导图像
4. **与 WLS 的关系**：TDS 是 WLS 的特例，其中引导图像等于输入图像
