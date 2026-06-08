# Deep Image Prior — 深度图像先验

> **论文：** Deep Image Prior  
> **作者：** Dmitry Ulyanov, Andrea Vedaldi, Victor Lempitsky  
> **发表：** CVPR 2018  
> **意义：** 证明卷积网络的结构本身就是一种强大的图像先验，无需训练数据

---

## 1. 核心思想

传统图像先验（TV、稀疏梯度等）是手工设计的。Deep Image Prior 的发现：**随机初始化的卷积网络在拟合图像时，会先学习低频结构，后学习高频噪声**。

因此，可以用网络结构本身作为隐式先验，通过早停（early stopping）实现去噪、超分辨率等任务。

---

## 2. 优化问题

$$\theta^* = \arg\min_\theta \mathcal{L}(f_\theta(\mathbf{z}), \mathbf{x}_0) \tag{1}$$

$$\hat{\mathbf{x}} = f_{\theta^*}(\mathbf{z}) \tag{2}$$

**符号说明：**
- $f_\theta$ — 卷积网络（U-Net 结构），参数为 $\theta$
- $\mathbf{z}$ — 固定的随机噪声输入（不更新）
- $\mathbf{x}_0$ — 退化的观测图像（噪声/低分辨率/遮挡）
- $\mathcal{L}$ — 重建损失（通常为 MSE）
- $\hat{\mathbf{x}}$ — 恢复的干净图像

---

## 3. 不同任务的损失函数

### 3.1 图像去噪

$$\mathcal{L}(\hat{\mathbf{x}}, \mathbf{x}_0) = \|\hat{\mathbf{x}} - \mathbf{x}_0\|^2 \tag{3}$$

### 3.2 图像修复（Inpainting）

$$\mathcal{L}(\hat{\mathbf{x}}, \mathbf{x}_0) = \|(\hat{\mathbf{x}} - \mathbf{x}_0) \odot \mathbf{m}\|^2 \tag{4}$$

其中 $\mathbf{m}$ 是掩码（已知区域为 1，缺失区域为 0）。

### 3.3 超分辨率

$$\mathcal{L}(\hat{\mathbf{x}}, \mathbf{x}_0) = \|\mathbf{D}(\hat{\mathbf{x}}) - \mathbf{x}_0\|^2 \tag{5}$$

其中 $\mathbf{D}$ 是下采样算子。

---

## 4. 网络结构（U-Net）

编码器-解码器结构，带跳跃连接：

$$f_\theta = \text{Decoder}(\text{Encoder}(\mathbf{z})) \tag{6}$$

- 编码器：逐步下采样，提取多尺度特征
- 解码器：逐步上采样，重建图像
- 跳跃连接：保留细节信息

---

## 5. 为什么有效？

**频谱偏置（Spectral Bias）**：卷积网络倾向于先学习低频分量（结构），后学习高频分量（噪声）。

在优化过程中：
- **早期迭代**：网络输出接近图像的低频结构（去噪效果好）
- **后期迭代**：网络开始拟合噪声（过拟合）

因此，**早停**是 Deep Image Prior 的关键：在网络开始拟合噪声之前停止优化。

---

## 6. 与传统方法的比较

| 特性 | 传统先验（TV/L0） | Deep Image Prior |
|------|-----------------|-----------------|
| 先验类型 | 手工设计 | 网络结构隐式定义 |
| 训练数据 | 不需要 | 不需要 |
| 优化 | 凸/非凸优化 | 梯度下降（Adam） |
| 速度 | 快（分钟级） | 慢（分钟~小时级） |
| 效果 | 好 | 更好（某些任务） |
