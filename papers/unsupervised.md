# Unsupervised Smoothing — 无监督学习图像平滑

> **论文：** Image Smoothing via Unsupervised Learning  
> **发表：** ACM TOG 2018  
> **作者：** QINGNAN FAN, JIAOLONG YANG, DAVID WIPF,  BAOQUAN CHEN, XIN TONG  
> **意义：** 无需配对训练数据，通过无监督学习实现边缘保持图像平滑

---

## 1. 核心思想

传统深度学习方法需要配对的（输入，目标）训练数据。无监督平滑通过设计自监督损失函数，仅用输入图像本身进行训练。

---

## 2. 无监督损失函数

$$\mathcal{L}(\theta; \mathbf{x}) = \mathcal{L}_{\text{smooth}}(f_\theta(\mathbf{x})) + \lambda \mathcal{L}_{\text{fidelity}}(f_\theta(\mathbf{x}), \mathbf{x}) \tag{1}$$

### 2.1 平滑损失

$$\mathcal{L}_{\text{smooth}}(u) = \sum_i \sum_{j \in \mathcal{N}(i)} w_{ij}(\mathbf{x}) (u_i - u_j)^2 \tag{2}$$

其中 $w_{ij}(\mathbf{x})$ 是由输入图像计算的边缘感知权重（如双边权重）。

### 2.2 保真损失

$$\mathcal{L}_{\text{fidelity}}(u, \mathbf{x}) = \|u - \mathbf{x}\|^2 \tag{3}$$

---

## 3. 网络结构

使用全卷积网络（类似 U-Net），输入图像，输出平滑图像：

$$u = f_\theta(\mathbf{x}) \tag{4}$$

---

## 4. 训练策略

**测试时优化（Test-time Optimization）：** 对每张测试图像单独优化网络参数：

$$\theta^* = \arg\min_\theta \mathcal{L}(\theta; \mathbf{x}) \tag{5}$$

这类似于 Deep Image Prior，但使用了明确的平滑先验（式 2）而非隐式的网络结构先验。

---

## 5. 与传统方法的关系

无监督平滑可以看作将 WLS 能量泛函（式 1）嵌入神经网络优化框架：
- 传统 WLS：直接求解线性系统
- 无监督平滑：用网络参数化解，通过梯度下降优化

网络的非线性表达能力使其能够学习比线性 WLS 更复杂的平滑模式。
