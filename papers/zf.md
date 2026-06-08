# ZF — 全卷积快速图像处理

> **论文：** Fast Image Processing with Fully-Convolutional Networks  
> **作者：** Qifeng Chen, Jia Xu, Vladlen Koltun  
> **发表：** ICCV 2017  
> **意义：** 用全卷积网络近似各种图像处理算子，实现实时处理

---

## 1. 核心思想

用全卷积网络 $\mathcal{F}_\theta$ 近似任意图像处理算子 $\mathcal{T}$：

$$\min_\theta \sum_n \|\mathcal{F}_\theta(\mathbf{x}_n) - \mathcal{T}(\mathbf{x}_n)\|_F^2 \tag{1}$$

其中 $\mathbf{x}_n$ 是训练图像，$\mathcal{T}(\mathbf{x}_n)$ 是目标算子的输出（如双边滤波、WLS、L0 平滑等）。

---

## 2. 网络架构：上下文聚合网络（CAN）

使用多尺度空洞卷积（dilated convolution）捕获大感受野：

$$\mathbf{h}^{(l)} = \sigma\!\left(\mathbf{W}^{(l)} *_{d_l} \mathbf{h}^{(l-1)} + \mathbf{b}^{(l)}\right) \tag{2}$$

空洞率序列：$d = \{1, 2, 4, 8, 16, 1, 1\}$

**感受野：** $1 + 2\sum_l (d_l \cdot (k-1)/2)$，其中 $k=3$ 是卷积核大小。

---

## 3. 损失函数

$$\mathcal{L}(\theta) = \frac{1}{N}\sum_{n=1}^N \|\mathcal{F}_\theta(\mathbf{x}_n) - \mathbf{y}_n\|_F^2 + \beta \|\theta\|^2 \tag{3}$$

其中 $\mathbf{y}_n = \mathcal{T}(\mathbf{x}_n)$ 是目标算子的输出，$\beta$ 是权重衰减系数。

---

## 4. 可近似的算子

ZF 证明了以下算子都可以被 CAN 高精度近似：
- 双边滤波（Bilateral Filter）
- WLS 滤波
- L0 平滑
- HDR 色调映射
- 去雾（Dehazing）
- 铅笔画生成

---

## 5. 速度优势

| 算子 | 原始速度 | ZF 近似速度 | 加速比 |
|------|---------|-----------|--------|
| 双边滤波 | 0.5s | 0.01s | 50× |
| WLS | 3.5s | 0.01s | 350× |
| L0 平滑 | 10s | 0.01s | 1000× |

ZF 实现了对复杂算子的实时近似，代价是需要针对每个算子单独训练。
