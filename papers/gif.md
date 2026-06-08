# GIF — 引导图像滤波

> **论文：** Guided Image Filtering  
> **作者：** Kaiming He, Jian Sun, Xiaoou Tang  
> **发表：** IEEE TPAMI 2013, Vol. 35, No. 6  
> **意义：** 局部线性模型族的奠基之作，$O(N)$ 复杂度，边缘保持的同时避免梯度反转

---

## 1. 背景与核心思想

引导滤波（Guided Image Filter, GIF）的核心假设是：**输出图像 $q$ 在局部窗口内是引导图像 $I$ 的线性函数**。

$$q_i = a_k I_i + b_k, \quad \forall i \in \omega_k \tag{1}$$

其中 $\omega_k$ 是以像素 $k$ 为中心的方形窗口（半径 $r$）。

**为什么用线性模型？**
- 线性变换保持梯度方向：$\nabla q = a_k \nabla I$，即输出的边缘与引导图像的边缘对齐
- 当 $a_k \approx 0$ 时（平坦区域），输出趋于常数 $b_k$（平滑效果）
- 当 $a_k \approx 1$ 时（边缘区域），输出跟随引导图像的结构

---

## 2. 能量泛函

为了使输出 $q$ 既接近输入 $p$，又满足线性模型约束，对每个窗口 $\omega_k$ 最小化：

$$E(a_k, b_k) = \sum_{i \in \omega_k} \underbrace{\left(a_k I_i + b_k - p_i\right)^2}_{\text{数据保真项}} + \underbrace{\epsilon \, a_k^2}_{\text{正则项}} \tag{2}$$

**各项含义：**
- **数据保真项**：要求线性模型的预测值 $a_k I_i + b_k$ 尽量接近输入 $p_i$
- **正则项** $\epsilon a_k^2$：惩罚过大的线性系数 $a_k$，防止在平坦区域（$\sigma_k^2 \approx 0$）出现数值不稳定；$\epsilon$ 越大，输出越平滑

---

## 3. 闭式解推导

### 3.1 对 $b_k$ 求偏导

$$\frac{\partial E}{\partial b_k} = 2\sum_{i \in \omega_k}(a_k I_i + b_k - p_i) = 0$$

$$\Rightarrow \quad |\omega| b_k = \sum_{i \in \omega_k}(p_i - a_k I_i)$$

$$\boxed{b_k = \bar{p}_k - a_k \mu_k} \tag{3}$$

其中 $\mu_k = \frac{1}{|\omega|}\sum_{i\in\omega_k} I_i$，$\bar{p}_k = \frac{1}{|\omega|}\sum_{i\in\omega_k} p_i$。

### 3.2 将 $b_k$ 代入，对 $a_k$ 求偏导

将式 (3) 代入 $E$，令 $r_i = p_i - \bar{p}_k$，$\tilde{I}_i = I_i - \mu_k$（中心化），则：

$$E(a_k) = \sum_{i \in \omega_k}(a_k \tilde{I}_i - r_i)^2 + \epsilon a_k^2$$

$$\frac{\partial E}{\partial a_k} = 2\sum_{i \in \omega_k}(a_k \tilde{I}_i - r_i)\tilde{I}_i + 2\epsilon a_k = 0$$

$$a_k \left(\sum_{i \in \omega_k} \tilde{I}_i^2 + \epsilon\right) = \sum_{i \in \omega_k} \tilde{I}_i r_i$$

注意到：
$$\frac{1}{|\omega|}\sum_{i\in\omega_k} \tilde{I}_i^2 = \sigma_k^2 \quad \text{（方差）}$$

$$\frac{1}{|\omega|}\sum_{i\in\omega_k} \tilde{I}_i r_i = \frac{1}{|\omega|}\sum_{i\in\omega_k} I_i p_i - \mu_k \bar{p}_k = \text{Cov}(I,p)_k$$

因此：

$$\boxed{a_k = \frac{\text{Cov}(I,p)_k}{\sigma_k^2 + \epsilon}} \tag{4}$$

### 3.3 物理解释

- **分子** $\text{Cov}(I,p)_k$：引导图像与输入的协方差，衡量两者的相关性
- **分母** $\sigma_k^2 + \epsilon$：引导图像的方差加正则项
  - 在**边缘区域**：$\sigma_k^2 \gg \epsilon$，故 $a_k \approx \text{Cov}/\sigma^2$，线性系数较大，保留边缘
  - 在**平坦区域**：$\sigma_k^2 \approx 0$，故 $a_k \approx 0$，输出趋于均值 $b_k = \bar{p}_k$（平滑）

---

## 4. 输出计算（重叠窗口平均）

每个像素 $i$ 属于多个窗口 $\omega_k$（$k \in \omega_i$），每个窗口给出一个预测 $a_k I_i + b_k$。取所有窗口的平均：

$$q_i = \frac{1}{|\omega|}\sum_{k \in \omega_i}(a_k I_i + b_k) = \bar{a}_i I_i + \bar{b}_i \tag{5}$$

其中：
$$\bar{a}_i = \frac{1}{|\omega|}\sum_{k \in \omega_i} a_k, \quad \bar{b}_i = \frac{1}{|\omega|}\sum_{k \in \omega_i} b_k$$

---

## 5. 显式滤波核

将式 (4)(3)(5) 展开，可以写出 GIF 的显式滤波核：

$$q_i = \sum_j W_{ij}(I) \, p_j \tag{6}$$

$$W_{ij}(I) = \frac{1}{|\omega|^2} \sum_{k:\, i,j \in \omega_k} \left(1 + \frac{(I_i - \mu_k)(I_j - \mu_k)}{\sigma_k^2 + \epsilon}\right) \tag{7}$$

**性质：**
- $W_{ij} \geq 0$（非负性）
- $\sum_j W_{ij} = 1$（归一性）
- $W_{ij} = W_{ji}$（对称性）
- 当 $I_i \approx I_j$（同侧边缘）时权重大；当 $I_i \neq I_j$（跨边缘）时权重小

---

## 6. 与 Matting Laplacian 的关系

定义 Matting Laplacian 矩阵 $L$，其元素为：

$$L_{ij} = \sum_{k:\, i,j \in \omega_k} \left(\delta_{ij} - \frac{1}{|\omega|}\left(1 + \frac{(I_i-\mu_k)(I_j-\mu_k)}{\sigma_k^2+\epsilon}\right)\right)$$

则 GIF 等价于求解以下二次优化问题的一步 Jacobi 迭代：

$$\min_q \; (q-p)^T \Lambda (q-p) + q^T L q$$

其中 $\Lambda = \text{diag}(\lambda_i)$ 是置信度矩阵。精确解为：

$$(L + \Lambda)q = \Lambda p$$

GIF 用 $\Lambda = I$（均匀置信度）并做一步近似，得到 $O(N)$ 的高效算法。

---

## 7. 算法流程

```
输入：引导图像 I，输入图像 p，窗口半径 r，正则参数 ε
输出：滤波结果 q

1. mean_I  = box_filter(I, r)          // μ_k
2. mean_p  = box_filter(p, r)          // p̄_k
3. corr_I  = box_filter(I·I, r)        // E[I²]_k
4. corr_Ip = box_filter(I·p, r)        // E[Ip]_k
5. var_I   = corr_I - mean_I·mean_I    // σ²_k
6. cov_Ip  = corr_Ip - mean_I·mean_p  // Cov(I,p)_k
7. a = cov_Ip / (var_I + ε)            // 式(4)
8. b = mean_p - a·mean_I               // 式(3)
9. mean_a  = box_filter(a, r)          // ā_i
10. mean_b = box_filter(b, r)          // b̄_i
11. q = mean_a·I + mean_b              // 式(5)
```

**复杂度：** $O(N)$，所有步骤均为逐像素运算或盒式滤波（可用积分图 $O(1)$ 查询）。

---

## 8. 参数选择指南

| 参数 | 作用 | 典型值 |
|------|------|--------|
| $r$ | 窗口半径，控制平滑范围 | 4 ~ 16 |
| $\epsilon$ | 边缘保持强度，越小越保边 | $0.01^2$ ~ $0.1^2$（归一化到 $[0,1]$） |

当 $I = p$（自引导）时，GIF 退化为边缘保持平滑滤波器。

---

## 9. 局限性

1. **梯度反转（Gradient Reversal）**：在纹理区域，$\sigma_k^2$ 较大但并非真正的边缘，导致 $a_k$ 偏大，引入虚假梯度。WGIF 通过引入边缘感知权重 $\Gamma$ 解决此问题（见 [WGIF 页面](/papers/wgif)）。
2. **光晕效应（Halo Artifact）**：在强边缘附近的平坦区域可能出现过冲。
3. **各向同性**：窗口内使用标量方差，无法区分不同方向的边缘。AGF 用结构张量解决此问题（见 [AGF 页面](/papers/agf)）。
