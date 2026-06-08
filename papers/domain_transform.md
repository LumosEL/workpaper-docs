# Domain Transform — 域变换边缘感知处理

> **论文：** Domain Transform for Edge-Aware Image and Video Processing  
> **作者：** Eduardo S. L. Gastal, Manuel M. Oliveira  
> **发表：** ACM SIGGRAPH 2011  
> **意义：** 将 2D 边缘感知滤波转化为 1D 递归滤波，实现 $O(N)$ 实时处理

---

## 1. 核心思想

**域变换**将图像的空间坐标变换到一个新的 1D 坐标系，使得在新坐标系中的欧氏距离等于原始图像中的测地距离（考虑颜色差异）。

在变换后的坐标系中，标准 1D 高斯滤波等价于原始图像中的边缘感知滤波。

---

## 2. 域变换定义

对于图像 $I$，沿水平方向的域变换定义为：

$$\tilde{x}(x, y) = \int_0^x \left(1 + \frac{\sigma_s}{\sigma_r} \left|\frac{\partial I}{\partial x'}(x', y)\right|\right) dx' \tag{1}$$

离散形式：

$$\tilde{x}(x, y) = \tilde{x}(x-1, y) + 1 + \frac{\sigma_s}{\sigma_r} \sum_{c} |I_c(x,y) - I_c(x-1,y)| \tag{2}$$

**符号说明：**
- $\sigma_s$ — 空间标准差（控制平滑范围）
- $\sigma_r$ — 范围标准差（控制边缘敏感度）
- $I_c$ — 图像第 $c$ 通道

---

## 3. 三种滤波实现

### 3.1 归一化卷积（NC）

在变换域中用高斯核卷积：

$$\hat{I}(x) = \frac{\sum_{x'} G_{\sigma_s}(\tilde{x}(x') - \tilde{x}(x)) I(x')}{\sum_{x'} G_{\sigma_s}(\tilde{x}(x') - \tilde{x}(x))} \tag{3}$$

### 3.2 递归滤波（RF）— 最高效

将高斯滤波近似为一阶递归滤波（IIR）：

**前向传递：**
$$\hat{I}^+(x) = (1 - a^{d(x)}) I(x) + a^{d(x)} \hat{I}^+(x-1) \tag{4}$$

**后向传递：**
$$\hat{I}^-(x) = (1 - a^{d(x+1)}) \hat{I}^+(x) + a^{d(x+1)} \hat{I}^-(x+1) \tag{5}$$

其中：
$$d(x) = \tilde{x}(x) - \tilde{x}(x-1) = 1 + \frac{\sigma_s}{\sigma_r}\sum_c |I_c(x) - I_c(x-1)|$$

$$a = \exp\!\left(-\frac{\sqrt{2}}{\sigma_s}\right) \tag{6}$$

### 3.3 插值（IC）

在变换域中进行线性插值，适用于非均匀采样。

---

## 4. 2D 扩展

对水平和垂直方向交替应用 1D 域变换滤波，重复 $N$ 次（通常 $N = 3$）：

```
for n = 1 to N:
  对每行应用水平域变换 RF
  对每列应用垂直域变换 RF
```

---

## 5. 复杂度

- 每次 1D 扫描：$O(N)$（递归滤波）
- 总复杂度：$O(N \cdot \text{iterations})$
- 实测：**实时处理**（比双边滤波快 10~100 倍）
