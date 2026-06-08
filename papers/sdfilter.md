# SD Filter — 非凸势函数鲁棒引导滤波

> **论文：** Robust Guided Image Filtering Using Nonconvex Potentials  
> **作者：** Bumsub Ham, Minsu Cho, Jean Ponce  
> **发表：** IEEE TPAMI 2018  
> **意义：** 将非凸势函数引入引导滤波框架，通过 ADMM 实现鲁棒的边缘保持

---

## 1. 核心能量泛函

$$E(u) = \lambda \sum_i c_i(u_i - f_i)^2 + V(u; g) \tag{1}$$

正则项：

$$V(u; g) = \sum_{(i,j) \in \mathcal{E}} \rho_m(g_i - g_j) \cdot \rho_n(u_i - u_j) \tag{2}$$

其中 $\rho$ 是非凸势函数（如 Welsch 函数）：

$$\rho(x; \sigma) = 1 - \exp\!\left(-\frac{x^2}{2\sigma^2}\right) \tag{3}$$

**符号说明：**
- $u$ — 输出图像
- $f$ — 输入图像
- $g$ — 引导图像
- $c_i \geq 0$ — 置信度权重
- $\rho_m, \rho_n$ — 引导域和输出域的非凸势函数
- $\mathcal{E}$ — 像素邻域对集合

---

## 2. 非凸势函数的性质

Welsch 函数 $\rho(x;\sigma) = 1 - e^{-x^2/(2\sigma^2)}$ 的关键性质：

- **非凸**：对大残差的惩罚趋于饱和（鲁棒性）
- **可微**：$\rho'(x) = \frac{x}{\sigma^2}e^{-x^2/(2\sigma^2)}$
- **当 $|x| \ll \sigma$**：$\rho(x) \approx x^2/(2\sigma^2)$（近似 L2）
- **当 $|x| \gg \sigma$**：$\rho(x) \to 1$（惩罚饱和，忽略离群点）

---

## 3. 半二次分裂求解

引入辅助变量 $v_{ij} \approx u_i - u_j$：

$$E_\beta(u, v) = \lambda \sum_i c_i(u_i - f_i)^2 + \sum_{(i,j)} \rho_m(g_i-g_j)\rho_n(v_{ij}) + \frac{\beta}{2}\sum_{(i,j)}(u_i - u_j - v_{ij})^2 \tag{4}$$

### 3.1 $v$-子问题（逐边独立）

$$v_{ij}^* = \arg\min_{v} \; \rho_m(g_i-g_j)\rho_n(v) + \frac{\beta}{2}(u_i - u_j - v)^2 \tag{5}$$

用梯度下降或查表法求解（非凸，可能有多个局部极值）。

### 3.2 $u$-子问题（线性系统）

$$\min_u \; \lambda \sum_i c_i(u_i - f_i)^2 + \frac{\beta}{2}\sum_{(i,j)}(u_i - u_j - v_{ij})^2 \tag{6}$$

对 $u_i$ 求偏导令其为零：

$$2\lambda c_i(u_i - f_i) + \beta \sum_{j \in N(i)}(u_i - u_j - v_{ij}) = 0$$

整理为线性系统：

$$\left(2\lambda C + \beta L\right) u = 2\lambda C f + \beta L_v \tag{7}$$

其中 $C = \text{diag}(c_i)$，$L$ 是图 Laplacian，$L_v$ 是由 $v_{ij}$ 构成的右端项。

---

## 4. 与 GIF 的关系

当 $\rho_m(x) = 1$（常数），$\rho_n(x) = x^2$（L2）时，SD Filter 退化为 WLS/GIF 框架。非凸势函数的引入使得：
- 跨越强边缘的像素对（$|g_i - g_j|$ 大）：$\rho_m \approx 1$，正常惩罚
- 跨越弱边缘/噪声的像素对：$\rho_m$ 小，减少惩罚（鲁棒性）
