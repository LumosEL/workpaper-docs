# QWLS — 二次加权最小二乘

> **论文：** Fast Global Image Smoothing via Quasi Weighted Least Squares  
> **发表：** IJCV 2024  
> **意义：** 统一 WLS 框架，引入二次权重设计，分析不同权重函数的边缘保持性质

---

## 1. 核心能量泛函

$$E(\mathbf{u}) = \sum_{i} (u_i - p_i)^2 + \lambda \sum_{i} \sum_{j \in \mathcal{N}(i)} w_{ij} (u_i - u_j)^2 \tag{1}$$

**二次权重定义：**

$$w_{ij} = \frac{1}{(|\nabla g_{ij}|^2 + \epsilon)^\alpha} \tag{2}$$

其中 $\nabla g_{ij} = g_i - g_j$（引导图像的局部差分），$\alpha \in (0, 1]$ 控制边缘敏感度。

---

## 2. 矩阵形式

$$E(\mathbf{u}) = (\mathbf{u} - \mathbf{p})^T(\mathbf{u} - \mathbf{p}) + \lambda \mathbf{u}^T \mathbf{L}_w \mathbf{u} \tag{3}$$

加权图 Laplacian：

$$[\mathbf{L}_w]_{ij} = \begin{cases} \sum_{k \in \mathcal{N}(i)} w_{ik} & j = i \\ -w_{ij} & j \in \mathcal{N}(i) \\ 0 & \text{otherwise} \end{cases}$$

---

## 3. 闭式解

$$\boxed{(\mathbf{I} + \lambda \mathbf{L}_w)\mathbf{u} = \mathbf{p}} \tag{4}$$

---

## 4. 迭代重加权方案（IRLS）

当权重依赖于输出 $\mathbf{u}$ 时（自适应权重），使用 IRLS：

**第 $t$ 次迭代：**

$$w_{ij}^{(t)} = \frac{1}{(u_i^{(t-1)} - u_j^{(t-1)})^2 + \epsilon} \tag{5}$$

$$(\mathbf{I} + \lambda \mathbf{L}_{w^{(t)}})\mathbf{u}^{(t)} = \mathbf{p} \tag{6}$$

---

## 5. 权重函数分析

QWLS 统一分析了不同权重函数的性质：

| 权重函数 | 对应方法 | 边缘保持性 |
|---------|---------|----------|
| $w_{ij} = 1$ | 标准 Laplacian（高斯平滑） | 无 |
| $w_{ij} = e^{-\|g_i-g_j\|/\sigma}$ | WLS/FGS | 好 |
| $w_{ij} = 1/(|\nabla g_{ij}|^2+\epsilon)^\alpha$ | **QWLS** | 可调 |
| $w_{ij} = 1/(|u_i-u_j|^2+\epsilon)$ | IRLS-L1 | 极好 |

---

## 6. 与 GIF 的统一视角

QWLS 证明了 GIF 可以近似为 WLS 的特例：GIF 的滤波核 $W_{ij}$ 对应于特定的加权图 Laplacian，其权重由引导图像的局部统计量决定。这一统一视角有助于理解不同方法的边缘保持机制。
