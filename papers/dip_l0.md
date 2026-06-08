# DIP+L0 — 深度图像先验 + L0 梯度正则化

> **论文：** Deep Image Prior with L0 Gradient Regularizer for Image Smoothing  
> **发表：** ICASSP 2026  
> **意义：** 将 Deep Image Prior 与 L0 梯度正则化结合，实现无监督图像平滑

---

## 1. 核心思想

将 Deep Image Prior 的网络结构先验与 L0 梯度正则化结合：

$$\theta^* = \arg\min_\theta \|f_\theta(\mathbf{z}) - \mathbf{x}_0\|^2 + \lambda \cdot C(f_\theta(\mathbf{z})) \tag{1}$$

其中 $C(\cdot)$ 是 L0 梯度计数（非零梯度像素数）。

---

## 2. 可微近似

L0 范数不可微，使用连续近似：

$$C(u) \approx \sum_p \left(1 - e^{-(\partial_x u_p)^2/\sigma^2}\right) + \left(1 - e^{-(\partial_y u_p)^2/\sigma^2}\right) \tag{2}$$

或使用半二次分裂将 L0 项转化为可微子问题（类似 L0 Smoothing）。

---

## 3. 优化策略

**外层循环**（网络参数更新）：

$$\theta^{n+1} = \theta^n - \eta \nabla_\theta \left[\|f_\theta(\mathbf{z}) - \mathbf{x}_0\|^2 + \lambda \cdot C(f_\theta(\mathbf{z}))\right] \tag{3}$$

**内层循环**（L0 辅助变量更新，类似 L0 Smoothing 的 Step A）：

$$h_p, v_p = \begin{cases} (0, 0) & \text{若 } (\partial_x u_p)^2 + (\partial_y u_p)^2 \leq \lambda/\beta \\ (\partial_x u_p, \partial_y u_p) & \text{否则} \end{cases} \tag{4}$$

---

## 4. 与纯 DIP 和纯 L0 的比较

| 方法 | 先验 | 训练数据 | 边缘保持 |
|------|------|---------|---------|
| L0 Smoothing | L0 梯度 | 不需要 | 极好 |
| Deep Image Prior | 网络结构 | 不需要 | 好 |
| **DIP+L0** | **网络结构 + L0** | **不需要** | **极好** |

结合两种先验的优势：网络结构先验提供全局一致性，L0 正则化确保梯度稀疏性。
