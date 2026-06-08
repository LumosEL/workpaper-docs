# SGWLS — 结构引导加权最小二乘

> **论文：** Semi-Global Weighted Least Squares in Image Filtering  
> **发表：** ICCV 2017  
> **意义：** 使用语义/结构图作为引导，实现结构感知的图像平滑

---

## 1. 核心能量泛函

$$E(\mathbf{u}) = \|\mathbf{u} - \mathbf{p}\|^2 + \lambda \left(\sum_i \frac{(\partial_x u_i)^2}{(\partial_x s_i)^2 + \epsilon} + \sum_i \frac{(\partial_y u_i)^2}{(\partial_y s_i)^2 + \epsilon}\right) \tag{1}$$

其中 $\mathbf{s}$ 是**结构图**（structure map），可以来自：
- 语义分割图
- 显著性图
- 深度图
- 另一幅图像的边缘图

---

## 2. 矩阵形式

$$(\mathbf{I} + \lambda \mathbf{L}_s)\mathbf{u} = \mathbf{p} \tag{2}$$

加权 Laplacian：

$$\mathbf{L}_s = \mathbf{D}_x^T \mathbf{C}_x \mathbf{D}_x + \mathbf{D}_y^T \mathbf{C}_y \mathbf{D}_y$$

$$C_{x,ii} = \frac{1}{(\partial_x s_i)^2 + \epsilon}, \quad C_{y,ii} = \frac{1}{(\partial_y s_i)^2 + \epsilon} \tag{3}$$

---

## 3. 结构图的作用

- **结构边缘处**：$|\partial_x s_i|$ 大 $\Rightarrow$ $C_{x,ii}$ 小 $\Rightarrow$ 该方向不平滑（保留结构边缘）
- **非结构区域**：$|\partial_x s_i| \approx 0$ $\Rightarrow$ $C_{x,ii}$ 大 $\Rightarrow$ 强平滑（去除纹理）

---

## 4. 与 WLS 的关系

SGWLS 是 WLS 的推广：
- WLS：$s = g = p$（自引导，权重由输入图像自身决定）
- SGWLS：$s$ 是独立的结构图（可以来自语义信息）

这使得 SGWLS 能够利用高层语义信息指导低层图像平滑，例如：
- 保留物体边界，平滑物体内部纹理
- 保留深度不连续处，平滑同一深度层内的噪声
