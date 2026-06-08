# SRCNN — 超分辨率卷积神经网络

> **论文：** Image Super-Resolution Using Deep Convolutional Networks  
> **作者：** Chao Dong, Chen Change Loy, Kaiming He, Xiaoou Tang  
> **发表：** IEEE TPAMI 2016  
> **意义：** 首个端到端的深度学习超分辨率方法，建立了 CNN 在低级视觉任务中的基础

---

## 1. 问题定义

给定低分辨率图像 $Y$（由高分辨率图像 $X$ 下采样并上采样得到），学习映射 $F: Y \to X$。

---

## 2. 网络结构

SRCNN 由三层卷积组成，对应三个步骤：

### 2.1 块提取与表示（Patch Extraction）

$$F_1(Y) = \max(0, W_1 * Y + B_1) \tag{1}$$

- 卷积核：$f_1 \times f_1 \times c \times n_1$（$f_1=9$，$n_1=64$）
- 提取 $n_1$ 个特征图，每个对应一种局部特征

### 2.2 非线性映射（Non-linear Mapping）

$$F_2(Y) = \max(0, W_2 * F_1(Y) + B_2) \tag{2}$$

- 卷积核：$f_2 \times f_2 \times n_1 \times n_2$（$f_2=1$，$n_2=32$）
- $1\times1$ 卷积实现逐像素的非线性映射

### 2.3 重建（Reconstruction）

$$F(Y) = W_3 * F_2(Y) + B_3 \tag{3}$$

- 卷积核：$f_3 \times f_3 \times n_2 \times c$（$f_3=5$）
- 线性重建，输出高分辨率图像

---

## 3. 损失函数

$$\mathcal{L}(\Theta) = \frac{1}{n}\sum_{i=1}^n \|F(Y_i; \Theta) - X_i\|^2 \tag{4}$$

其中 $\Theta = \{W_1, W_2, W_3, B_1, B_2, B_3\}$ 是网络参数，$n$ 是训练样本数。

---

## 4. 与稀疏编码的关系

SRCNN 可以解释为稀疏编码超分辨率的端到端版本：
- $F_1$：字典学习（提取 patch 特征）
- $F_2$：稀疏编码（非线性映射）
- $F_3$：重建（从高分辨率字典重建）

---

## 5. 训练细节

- 输入：从高分辨率图像下采样后双三次插值上采样的图像
- 输出：原始高分辨率图像
- 优化器：SGD + 动量
- 学习率：$10^{-4}$（前两层），$10^{-5}$（最后一层）
- 数据集：ImageNet（91 张图像用于快速训练）
