# ISGIF — 迭代结构引导图像滤波

> **论文：** Iterative Structure-Guided Image Filtering  
> **发表：** IEEE TCSVT 2024  
> **意义：** 通过迭代更新结构图，实现自适应的结构引导滤波

---

## 1. 核心能量泛函

$$E(\mathbf{u}) = \|\mathbf{u} - \mathbf{p}\|^2 + \lambda \sum_{i,j \in \mathcal{N}} w_{ij}^{(s)} (u_i - u_j)^2 \tag{1}$$

结构引导权重：

$$w_{ij}^{(s)} = \exp\!\left(-\frac{\|s_i - s_j\|^2}{2\sigma_s^2}\right) \tag{2}$$

其中 $\mathbf{s}$ 是从引导图像提取的结构图。

---

## 2. 迭代方案

**初始化：** $\mathbf{u}^0 = \mathbf{p}$，$\mathbf{s}^0 = \text{GIF}(\mathbf{g}, \mathbf{g}; r_s, \epsilon_s)$（大窗口 GIF 提取粗结构）

**第 $t$ 次迭代：**

1. 更新结构图：$\mathbf{s}^{(t)} = \mathcal{F}_{\text{struct}}(\mathbf{u}^{(t-1)})$
2. 更新权重：$w_{ij}^{(t)} = \exp(-\|s_i^{(t)} - s_j^{(t)}\|^2 / (2\sigma_s^2))$
3. 求解线性系统：$(\mathbf{I} + \lambda \mathbf{L}_{w^{(t)}})\mathbf{u}^{(t)} = \mathbf{p}$

---

## 3. 结构提取算子

$$\mathbf{s} = \text{GIF}(\mathbf{g}, \mathbf{g}; r_s, \epsilon_s) \tag{3}$$

使用大窗口半径 $r_s$（如 $r_s = 16$）的 GIF 提取粗尺度结构，忽略细节纹理。

---

## 4. 收敛性

随着迭代进行，结构图 $\mathbf{s}^{(t)}$ 逐渐与当前输出 $\mathbf{u}^{(t)}$ 对齐，权重 $w_{ij}^{(t)}$ 更准确地反映真实结构边界，最终收敛到稳定解。

通常 3~5 次迭代即可收敛。
