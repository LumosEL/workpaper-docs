# GGIF — 梯度域引导图像滤波

> **论文：** Gradient-Domain Guided Image Filtering  
> **发表：** IEEE TIP 2015  
> **意义：** 在 GIF 的能量泛函中增加梯度域约束，改善边缘过渡的锐利度

---

## 1. 核心改进

GGIF 在 GIF 的能量泛函中增加**梯度域保真项**，要求输出的梯度也接近输入的梯度：

$$E(a_k, b_k) = \sum_{i \in \omega_k} \left[(a_k g_i + b_k - p_i)^2 + \epsilon a_k^2\right] + \gamma \sum_{i \in \omega_k} \left[(\partial_x(a_k g_i + b_k) - \partial_x p_i)^2 + (\partial_y(a_k g_i + b_k) - \partial_y p_i)^2\right] \tag{1}$$

由于 $b_k$ 是常数，$\nabla b_k = 0$，梯度项简化为：

$$\gamma \sum_{i \in \omega_k} a_k^2 \left[(\partial_x g_i)^2 + (\partial_y g_i)^2\right] = \gamma a_k^2 \sum_{i \in \omega_k} \|\nabla g_i\|^2 \tag{2}$$

---

## 2. 闭式解

合并正则项：

$$E(a_k, b_k) = \sum_{i \in \omega_k} (a_k g_i + b_k - p_i)^2 + \left(\epsilon + \gamma \overline{\|\nabla g\|^2}_k\right) a_k^2 \tag{3}$$

其中 $\overline{\|\nabla g\|^2}_k = \frac{1}{|\omega|}\sum_{i\in\omega_k}\|\nabla g_i\|^2$。

与 GIF 推导完全相同，得到：

$$\boxed{a_k = \frac{\text{Cov}(g, p)_k}{\sigma_{g,k}^2 + \epsilon + \gamma \overline{\|\nabla g\|^2}_k}} \tag{4}$$

$$b_k = \bar{p}_k - a_k \bar{g}_k \tag{5}$$

---

## 3. 与 GIF 的对比

| 特性 | GIF | GGIF |
|------|-----|------|
| 正则项 | $\epsilon a_k^2$ | $(\epsilon + \gamma\overline{\|\nabla g\|^2}_k) a_k^2$ |
| 边缘处 | 正则化固定 | 正则化增大（梯度大） |
| 效果 | 边缘可能过渡模糊 | 边缘过渡更锐利 |

**注意：** GGIF 在边缘处增大正则化（与 WGIF 相反），这使得边缘处的 $a_k$ 更小，输出更接近均值，从而产生更锐利的边缘过渡（减少光晕）。
