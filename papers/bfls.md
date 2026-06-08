# BFLS — 双边滤波嵌入最小二乘

> **论文：** Embedding Bilateral Filter in Least Squares for Efficient Edge-Preserving Image Smoothing  
> **发表：** IEEE TCSVT 2020  
> **意义：** 将双边滤波权重嵌入 WLS 框架，用置换格（permutohedral lattice）高效近似

---

## 1. 核心能量泛函

$$E(\mathbf{u}) = \sum_i (u_i - p_i)^2 + \lambda \sum_i \sum_{j \in \mathcal{N}(i)} w_{ij}^{\text{BF}} (u_i - u_j)^2 \tag{1}$$

**双边滤波权重：**

$$w_{ij}^{\text{BF}} = \exp\!\left(-\frac{\|x_i - x_j\|^2}{2\sigma_s^2} - \frac{(p_i - p_j)^2}{2\sigma_r^2}\right) \tag{2}$$

其中 $x_i, x_j$ 是像素的空间坐标，$\sigma_s, \sigma_r$ 分别是空间和范围带宽。

---

## 2. 线性系统

$$(\mathbf{I} + \lambda \mathbf{L}_{\text{BF}})\mathbf{u} = \mathbf{p} \tag{3}$$

其中 $\mathbf{L}_{\text{BF}} = \mathbf{D}_{\text{BF}} - \mathbf{W}_{\text{BF}}$ 是双边 Laplacian。

---

## 3. 置换格近似

直接构建 $\mathbf{W}_{\text{BF}}$ 需要 $O(N^2)$ 空间，BFLS 使用**置换格（Permutohedral Lattice）**近似：

$$\mathbf{W}_{\text{BF}} \approx \mathbf{S}^T \mathbf{\Lambda} \mathbf{S} \tag{4}$$

其中：
- $\mathbf{S}$：$N \times M$ 的 splatting 矩阵（将像素映射到格点），$M \ll N$
- $\mathbf{\Lambda}$：$M \times M$ 的对角归一化矩阵

**近似线性系统：**

$$(\mathbf{I} + \lambda(\mathbf{D}_{\text{BF}} - \mathbf{S}^T \mathbf{\Lambda} \mathbf{S}))\mathbf{u} = \mathbf{p} \tag{5}$$

用预条件共轭梯度（PCG）求解，每次矩阵-向量乘法的复杂度为 $O(N + M)$。

---

## 4. 与双边滤波的关系

双边滤波可以写为：

$$\text{BF}[p]_i = \frac{\sum_j w_{ij}^{\text{BF}} p_j}{\sum_j w_{ij}^{\text{BF}}}$$

BFLS 将双边滤波的权重嵌入全局优化框架，获得比迭代双边滤波更好的边缘保持效果，同时避免了双边滤波的梯度反转问题。

---

## 5. 参数说明

| 参数 | 含义 | 典型值 |
|------|------|--------|
| $\sigma_s$ | 空间带宽 | 5 ~ 20 像素 |
| $\sigma_r$ | 范围带宽 | 0.05 ~ 0.2（归一化） |
| $\lambda$ | 平滑强度 | 0.1 ~ 10 |
