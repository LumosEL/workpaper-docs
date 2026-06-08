# L0G — L0 梯度正则化图像平滑

> **论文：** L0 梯度极小化耦合梯度保真的保结构图像平滑  
> **发表：** 中国科学：信息科学 2014  
> **意义：** L0 Smoothing 的中文扩展版本，详细分析了 L0 正则化的性质与应用

---

## 1. 核心能量泛函

&emsp;&emsp;与 L0 Smoothing 相同的基本框架：

$$\min_S \; \sum_p (S_p - I_p)^2 + \lambda \cdot C(S) \tag{1}$$

$$C(S) = \#\left\{p \;\Big|\; |\partial_x S_p| + |\partial_y S_p| \neq 0\right\} \tag{2}$$

&emsp;&emsp;完整的能量泛函：

$$\min_{S} \left\{ \sum_{p} \left| \nabla (\Delta^{-1}) (S_p - I_p) \right|^2 + \alpha \cdot \left| \nabla S_p - \nabla I_p \right|^2 + \lambda \cdot C(S)  \right\}\tag{3}$$
&emsp;&emsp;模型求解能量泛函：引入两个参数，分别是$h_p$,$v_p$,分别代替$\partial_x S_p$和$\partial_y S_p$
$$\min_{S} \left\{ \sum_{p} \left| \nabla (\Delta^{-1}) (S_p - I_p) \right|^2 + \alpha \cdot \left| \nabla S_p - \nabla I_p \right|^2 + \lambda \cdot C(h, v) + \beta \cdot \left( (\partial_x S_p - h_p)^2 + (\partial_y S_p - v_p)^2 \right) \right\}\tag{4}$$
---
## 2.1 子问题1：求解S
&emsp;&emsp;在公式(4)中，忽略不含有S的项，并且假设(h,v)已知,则求解S变成以下的极小化问题：
$$\min_{S} \left\{ \sum_{p} \left| \nabla (\Delta^{-1}) (S_p - I_p) \right|^2 + \alpha \cdot \left| \nabla S_p - \nabla I_p \right|^2 + \beta \cdot \left( (\partial_x S_p - h_p)^2 + (\partial_y S_p - v_p)^2 \right) \right\}\tag{5}$$
&emsp;&emsp;利用傅里叶变换的卷积理论和微分算子的对角化，本文使用快速傅里叶变换来加速求解过程，从而得到
$$S = \mathcal{F}^{-1}\!\left(\frac{\mathcal{F}(I) + \beta\left(\overline{\mathcal{F}(d_x)} \odot \mathcal{F}(h) + \overline{\mathcal{F}(d_y)} \odot \mathcal{F}(v)\right)}{1 + \beta\left(|\mathcal{F}(d_x)|^2 + |\mathcal{F}(d_y)|^2\right)}\right) \tag{6}$$
&emsp;&emsp;在式 (4) 中忽略不含 $S$ 的项, 并且假设 $(h,v)$ 已知, 则求解 $S$ 变成如下的极小化问题:

$$ \min_{S} \left\{ \sum_{p} |\nabla(\Delta^{-1})(S_p - I_p)|^2 + \alpha \cdot |\nabla S_p - \nabla I_p|^2 + \beta \cdot ((\partial_x S_p - h_p)^2 + (\partial_y S_p - v_p)^2) \right\}. \quad (5) $$

&emsp;&emsp;利用傅里叶 (Fourier) 变换的卷积理论和微分算子的对角化, 本文采取快速傅里叶变换 (FFT) 来加速求解过程, 从而得到
$$ S = F^{-1} \left( \frac{F(I) + \alpha \cdot A + \beta \cdot B}{1 + (\alpha + \beta) \cdot F(\Delta)^2} \right), \tag{7} $$
&emsp;&emsp;其中,

&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;$A = F(\Delta)^2 F(I)$,

&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;$B = -F(\Delta)(F^*(\partial_x) \cdot F(h) + F^*(\partial_y) \cdot F(v))$

&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;$F(\Delta) = F(-(\partial_x^T \partial_x + \partial_y^T \partial_y)) = -(F(\partial_x)^* F(\partial_x) + F(\partial_y)^* F(\partial_y))$

&emsp;&emsp;$F$ 是 FFT 算子, $F()^*$ 是 $F$ 的复共轭, $\partial_x$ 和 $\partial_y$ 分别为 $x$ 和 $y$ 方向的微分算子, T 为转置符号, $\Delta$ 是拉普拉斯算子, $\nabla$ 是梯度算子, $\nabla \cdot$ 是散度算子, 并且有如下关系:

$$ \begin{aligned} \Delta = (\nabla \cdot) \nabla = -&\nabla^T \nabla = -(\partial_x^T \partial_x + \partial_y^T \partial_y), 
\\ &\nabla^T = -\nabla \cdot \end{aligned} \tag{8} $$

&emsp;&emsp;为了使梯度变化尽量平缓, 同时也是为了扩大梯度的可控范围, 本文将 $A$ 中的 FFT 变换公式改成如下形式:
$$ F = F_x \circ F_y \rightarrow F' = F_x + F_y, \tag{9} $$
&emsp;&emsp;其中 $F_x$ 为按行进行 FFT, $F_y$ 为按列进行 FFT, $F_x \circ F_y$ 为算子 $F_x$ 和 $F_y$ 的复合, $F_x + F_y$ 为算子的加和. 根据傅里叶变换频谱的理论, 上述将一个 FFT 换成按行和按列两个算子加和的形式可以使得图像的振荡的纹理部分趋于平缓和集中, 因此可以实现图像中纹理部分的进一步移除.优化后的最终公式为
$$ S = F^{-1} \left( \frac{F(I) + \alpha \cdot A' + \beta \cdot B}{1 + (\alpha + \beta) \cdot F(\Delta)^2} \right), \tag{10} $$

&emsp;&emsp;其中, $A' = F'(\Delta)^2 F'(I)$.

&emsp;&emsp;此子问题为三项的和，接下来逐项分解每一项的求解方法。

&emsp;&emsp;泛函的第一项即为图像保真项 $|\nabla(\Delta^{-1})(S_p - I_p)|^2$。

&emsp;&emsp;在绝大多数经典的图像复原与平滑算法（如原始 $L_0$ 模型、经典 TV 模型）中，保证输出图像 $S$ 不偏离输入图像 $I$ 的常用手段是直接采用 $L_2$ 范数，即约束两者在像素级的平方误差绝对最小。即$|(S_p - I_p)|^2$

&emsp;&emsp;然而，当输入图像存在海量高频纹理时，$L_2$ 范数会对每一个微小的纹理起伏误差施加严厉的惩罚，这种“短视”的像素级严格逼近极大地阻碍了平滑算子对纹理的深层抹除。基于 Meyer 振荡模式理论（Oscillating Patterns）与 OSV（Osher, Solé, Vese）图像分解模型的深层启发，该模型使用 $H^{-1}$ 范数（作为 $G$ 范数的一种可计算近似）来替代传统的 $L_2$ 范数.

&emsp;&emsp;从数学算子的角度来看，式中的$\Delta^{-1}$代表拉普拉斯算子的逆运算,其物理本质是一个作用于全域的积分平滑算子。这意味着，在评估$S$与$I$的残差信号之前，模型首先对残差信号在空间域上进行了一次积分映射。这种设计的精妙之处在于对频率极度敏感。如果$S_p - I_p$的残差是由需要被抹除的高频纹理构成的，由于纹理信号呈现出高频率的正负交变振荡，在经过$\Delta^{-1}$ 的空间积分后，这些正负振荡会相互抵消，使得高频分量在积分域内的能量急剧坍塌逼近于零。因此，模型对高频纹理的去除采取了极其“宽容”的态度，不会产生显著的能量惩罚。反之，如果算法错误地抹除了图像中具有低频特性的宏观结构（如大面积的阴影过渡、颜色相近物体的微弱轮廓），此时$S_p - I_p$会呈现出大面积、同符号的直流偏置（DC Bias）。这种低频差异在积分算子的作用下不仅不会抵消，反而会发生剧烈的能量累积膨胀，从而在能量泛函中产生不可逾越的巨大惩罚。正是这一$H^{-1}$ 范数项，赋予了模型即使在过度平滑的参数设定下，依然能够死死“咬住”原图中低对比度拓扑结构的能力 。

## 2.2子问题 2：基于空间独立的硬阈值梯度截断在优化的后半程，

&emsp;&emsp;假设刚刚计算出的重构图像 $S$ 是已知恒定的，问题将转移至求解逼近梯度场 $(h, v)$。此时的目标泛函聚焦于如何处理非凸的 $L_0$ 计数惩罚 ：

$$\min_{h,v} \left\{ \sum_{p} \left( (\partial_x S_p - h_p)^2 + (\partial_y S_p - v_p)^2 \right) + \frac{\lambda}{\beta} C(h,v) \right\}\tag{16}$$

&emsp;&emsp;由于 $C(h,v)$ 的定义是逐像素点进行独立的非零状态判定，上述全局积分泛函可以极其令人惊叹地被彻底“粉碎”为每一个独立像素点 $p$ 上的局部极小值问题 ：

$$\min_{h_p,v_p} \left\{ (\partial_x S_p - h_p)^2 + (\partial_y S_p - v_p)^2 + \frac{\lambda}{\beta} H(|h_p|, |v_p|) \right\}\tag{17}$$

&emsp;&emsp;其中，二值化指示函数 $H(|h_p|, |v_p|)$ 当且仅当 $|h_p| + |v_p| \neq 0$ 时取值为 $1$，否则为 $0$ 。面对如此简单的二元状态空间，最优解可通过直接的代数比较获得。如果我们选择保留当前的实际梯度，即令 $(h_p, v_p) = (\partial_x S_p, \partial_y S_p)$，平方误差项将完美抵消为零，此时的能量代价仅为非零惩罚项常数 $\lambda/\beta$。反之，如果我们强行抹平该点的梯度，即令 $(h_p, v_p) = (0, 0)$，非零惩罚项 $H$ 将降为零，但我们要承受的能量代价是梯度的平方和 $(\partial_x S_p)^2 + (\partial_y S_p)^2$。因此，系统自然形成了一个极其清晰的硬阈值（Hard Thresholding）裁决法则：
$$(h_p, v_p) = \begin{cases}
(0, 0), & \text{当 } (\partial_x S_p)^2 + (\partial_y S_p)^2 \le \frac{\lambda}{\beta} \\
(\partial_x S_p, \partial_y S_p), & \text{其他情况}
\end{cases}\tag{18}$$
&emsp;&emsp;这一公式揭示了算法在微观层面“杀伐果断”的运行机制。阈值 $\lambda/\beta$ 是一把动态的尺子。在算法启动初期，罚参数 $\beta$ 极小，导致判断阈值极大。这意味着图像中绝大多数的微小波动、中等纹理甚至部分边缘，都会被无情地“一刀切”归零，实现彻底的粗粒度去纹理。随着外层循环的推进，$\beta$ 按 $\kappa$ 倍数指数级膨胀，导致阈值 $\lambda/\beta$ 迅速衰减。此时，系统对梯度的截断变得越来越吝啬，只有极其微弱的残余噪声会被清除，系统全面转向对保留下来的宏观结构进行高精度的闭包微调，直至最终收敛 。

---


## 2. 扩展：彩色图像处理

对于彩色图像（RGB 三通道），L0G 将梯度计数扩展为：

$$C(S) = \#\left\{p \;\Big|\; \sum_{c \in \{R,G,B\}} \left(|\partial_x S_p^c| + |\partial_y S_p^c|\right) \neq 0\right\} \tag{11}$$

即只要任意通道有非零梯度，该像素就被计入。

---

## 3. 半二次分裂（与 L0 Smoothing 相同）

引入辅助变量 $h_p^c \approx \partial_x S_p^c$，$v_p^c \approx \partial_y S_p^c$：

$$\min_{S,h,v} \; \sum_p \sum_c (S_p^c - I_p^c)^2 + \lambda C(h,v) + \beta \sum_p \sum_c \left[(h_p^c - \partial_x S_p^c)^2 + (v_p^c - \partial_y S_p^c)^2\right] \tag{12}$$

### 3.1 $(h,v)$-子问题（彩色版本）

$$\min_{h_p, v_p} \; \sum_c \left[(h_p^c - \partial_x S_p^c)^2 + (v_p^c - \partial_y S_p^c)^2\right] + \frac{\lambda}{\beta} H\!\left(\sum_c |h_p^c| + |v_p^c|\right) \tag{13}$$

**闭式解：**

$$\begin{cases} (h_p^c, v_p^c) = (0, 0) \; \forall c & \text{若 } \sum_c \left[(\partial_x S_p^c)^2 + (\partial_y S_p^c)^2\right] \leq \lambda/\beta \\ (h_p^c, v_p^c) = (\partial_x S_p^c, \partial_y S_p^c) & \text{否则} \end{cases} \tag{14}$$

### 3.2 $S$-子问题（FFT，逐通道）

每个通道独立求解（与灰度版本相同）：

$$S^c = \mathcal{F}^{-1}\!\left(\frac{\mathcal{F}(I^c) + \beta\left(\overline{\mathcal{F}(d_x)} \odot \mathcal{F}(h^c) + \overline{\mathcal{F}(d_y)} \odot \mathcal{F}(v^c)\right)}{1 + \beta\left(|\mathcal{F}(d_x)|^2 + |\mathcal{F}(d_y)|^2\right)}\right) \tag{15}$$

---

## 4. 应用分析

L0G 详细分析了 L0 正则化在以下任务中的应用：
- **图像平滑**：去除纹理，保留主要结构
- **边缘提取**：平滑后的梯度即为主要边缘
- **HDR 色调映射**：在对数域应用 L0 平滑
- **图像分割**：L0 平滑后的图像更易于分割
