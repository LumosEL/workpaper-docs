# GCP Denoising — 绿通道先验图像去噪

> **论文：** Image Denoising Using Green Channel Prior  
> **发表：** IEEE TIP 2025  
> **意义：** 利用 Bayer 传感器中绿通道的高信噪比特性，作为去噪的先验信息

---

## 1. 背景：Bayer 传感器的绿通道优势

在 Bayer 彩色滤波阵列中，绿色像素占总像素的 50%（红色和蓝色各占 25%）。因此：
- 绿通道的**采样密度**是红/蓝通道的 2 倍
- 绿通道的**信噪比（SNR）**更高
- 绿通道可以作为红/蓝通道去噪的**引导图像**

---

## 2. 核心能量泛函

$$\min_{u_R, u_B} \; \|u_R - p_R\|^2 + \|u_B - p_B\|^2 + \lambda_1 \mathbf{u}_R^T \mathbf{L}_G \mathbf{u}_R + \lambda_2 \mathbf{u}_B^T \mathbf{L}_G \mathbf{u}_B \tag{1}$$

其中：
- $u_R, u_B$ — 去噪后的红/蓝通道
- $p_R, p_B$ — 含噪的红/蓝通道
- $\mathbf{L}_G$ — 基于绿通道 $G$ 的加权 Laplacian

---

## 3. 绿通道引导权重

$$w_{ij}^G = \exp\!\left(-\frac{(G_i - G_j)^2}{2\sigma_G^2}\right) \tag{2}$$

**直觉：** 绿通道中相似的像素（$G_i \approx G_j$）在红/蓝通道中也应该相似，因此给予大权重（强平滑）；绿通道中差异大的像素对应边缘，给予小权重（保留边缘）。

---

## 4. 线性系统

$$(\mathbf{I} + \lambda_1 \mathbf{L}_G) \mathbf{u}_R = \mathbf{p}_R \tag{3}$$

$$(\mathbf{I} + \lambda_2 \mathbf{L}_G) \mathbf{u}_B = \mathbf{p}_B \tag{4}$$

两个系统共享相同的 Laplacian $\mathbf{L}_G$，可以复用分解结果。

---

## 5. 与 GIF 的关系

GCP 去噪等价于以绿通道 $G$ 为引导图像、以红/蓝通道为输入的 WLS 滤波：

$$u_c = (I + \lambda \mathbf{L}_G)^{-1} p_c, \quad c \in \{R, B\}$$

这与 GIF 的矩阵形式 $(L + \Lambda)q = \Lambda p$ 完全对应（其中 $\Lambda = I$，$L = \lambda \mathbf{L}_G$）。
