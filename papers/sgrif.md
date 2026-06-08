# SGRIF — 视网膜图像结构保持滤波

> **论文：** Structure-Preserving Guided Retinal Image Filtering and Its Application for Optic Disk Analysis  
> **发表：** IEEE TMI 2018  
> **意义：** 针对视网膜图像的特殊结构（血管、视盘），设计专用的结构保持滤波器

---

## 1. 核心能量泛函

$$E(\mathbf{u}) = \|\mathbf{u} - \mathbf{p}\|^2 + \lambda_1 \mathbf{u}^T \mathbf{L}_g \mathbf{u} + \lambda_2 \mathbf{u}^T \mathbf{L}_v \mathbf{u} \tag{1}$$

**双重 Laplacian 正则化：**
- $\mathbf{L}_g$：基于图像强度的 Laplacian（保持强度边缘）
- $\mathbf{L}_v$：基于血管概率图的 Laplacian（保持血管结构）

---

## 2. 权重定义

**强度权重：**

$$w_{ij}^g = \exp\!\left(-\frac{(g_i - g_j)^2}{2\sigma_g^2}\right) \tag{2}$$

**血管结构权重：**

$$w_{ij}^v = \exp\!\left(-\frac{\|v_i - v_j\|^2}{2\sigma_v^2}\right) \tag{3}$$

其中 $\mathbf{v}$ 是血管概率图（由血管分割算法得到）。

---

## 3. 线性系统

$$(\mathbf{I} + \lambda_1 \mathbf{L}_g + \lambda_2 \mathbf{L}_v)\mathbf{u} = \mathbf{p} \tag{4}$$

用共轭梯度法求解。

---

## 4. 应用：视盘分析

SGRIF 的主要应用是视网膜图像的视盘（optic disk）分析：
1. 用 SGRIF 平滑视网膜图像，保留视盘边界和血管结构
2. 在平滑后的图像上进行视盘分割
3. 分割结果更准确，受噪声和光照不均匀影响更小
