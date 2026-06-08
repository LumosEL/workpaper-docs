# FS — 快速平滑 (TCSVT 2013)

> **论文：** Fast Smoothing (FS)  
> **发表：** IEEE TCSVT 2013  
> **意义：** 基于局部统计量的快速边缘保持平滑算法

---

## 1. 核心思想

FS 通过局部均值和方差的自适应加权，实现快速的边缘保持平滑，无需求解线性系统。

---

## 2. 核心公式

对每个像素 $p$，平滑输出为：

$$u_p = \frac{\sum_{q \in \omega_p} w_{pq} \cdot I_q}{\sum_{q \in \omega_p} w_{pq}} \tag{1}$$

**自适应权重：**

$$w_{pq} = \exp\!\left(-\frac{(I_p - I_q)^2}{2\sigma_r^2(p)}\right) \tag{2}$$

其中 $\sigma_r^2(p)$ 是**自适应范围带宽**，由局部方差决定：

$$\sigma_r^2(p) = \max\!\left(\sigma_{\min}^2, \; \frac{1}{|\omega_p|}\sum_{q \in \omega_p}(I_q - \mu_p)^2\right) \tag{3}$$

---

## 3. 自适应带宽的作用

- **平坦区域**：局部方差小 $\Rightarrow$ $\sigma_r^2(p) = \sigma_{\min}^2$（最小带宽）$\Rightarrow$ 权重对强度差异敏感 $\Rightarrow$ 强平滑
- **边缘区域**：局部方差大 $\Rightarrow$ $\sigma_r^2(p)$ 大 $\Rightarrow$ 权重对强度差异不敏感 $\Rightarrow$ 弱平滑（保留边缘）

---

## 4. 与双边滤波的关系

FS 是双边滤波的变体，区别在于：
- 双边滤波：固定范围带宽 $\sigma_r$
- FS：自适应范围带宽 $\sigma_r(p)$（由局部方差决定）

自适应带宽使 FS 在不同区域自动调整平滑强度，无需手动调参。

---

## 5. 快速实现

利用积分图（Integral Image）加速局部统计量的计算：
- $\mu_p$：$O(1)$ 查询
- $\sigma_r^2(p)$：$O(1)$ 查询

总复杂度：$O(N \cdot |\omega|)$，但通过近似可降至 $O(N)$。
