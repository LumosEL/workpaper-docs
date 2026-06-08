# AGF — 各向异性引导滤波

> **论文：** Anisotropic Guided Filtering  
> **作者：** Carlo Noel Ochotorena & Yukihiko Yamashita  
> **发表：** IEEE TIP 2020  
> **意义：** 用各向异性加权平均替代 GIF 的均匀窗口平均，实现方向感知的边缘保持滤波

---

## 1. GIF 的各向同性局限

GIF 在输出计算时对所有窗口内的系数 $a_k$ 做**均匀平均**：

$$\bar{a}_i = \frac{1}{|\omega|} \sum_{k \in \omega_i} a_k$$

这种均匀平均无法区分不同方向的边缘——跨边缘的系数与沿边缘的系数被同等对待，导致边缘模糊。

---

## 2. 各向异性加权平均

AGF 用**各向异性权重** $w_{ij}$ 替代均匀平均：

$$\tilde{a}_i = \frac{\sum_{j \in N(i)} w_{ij} \, a_j}{\sum_{j \in N(i)} w_{ij}} \tag{1}$$

$$\tilde{b}_i = \frac{\sum_{j \in N(i)} w_{ij} \, b_j}{\sum_{j \in N(i)} w_{ij}} \tag{2}$$

输出：

$$\hat{x}_i = \tilde{a}_i \, g_i + \tilde{b}_i \tag{3}$$

其中 $a_j, b_j$ 仍由标准 GIF 的闭式解计算：

$$a_j = \frac{\text{Cov}(x, g)_j}{\sigma_{g,j}^2 + \gamma}, \quad b_j = \bar{x}_j - a_j \bar{g}_j \tag{4}$$

---

## 3. 边缘权重设计

权重 $w_{ij}$ 由引导图像的局部方差决定：

$$w_j = \frac{\epsilon}{\sigma_{g,j}^{2\alpha} + \epsilon} \tag{5}$$

其中：
- $\sigma_{g,j}^2$ — 以像素 $j$ 为中心的窗口内引导图像的方差
- $\alpha > 0$ — 控制各向异性强度（推荐 $\alpha = \max(\log_{10}\gamma, 0)$）
- $\epsilon$ — 数值稳定小常数

**性质：**
- **平坦区域**：$\sigma_{g,j}^2 \approx 0$ $\Rightarrow$ $w_j \approx 1$（均匀平均，强平滑）
- **边缘区域**：$\sigma_{g,j}^2$ 大 $\Rightarrow$ $w_j \approx 0$（边缘处系数权重小，减少跨边缘平均）

### 3.1 权重推导

权重 $w_j$ 来自以下优化问题的闭式解：

$$\arg\min_{w_i} \sum_{j \in N(i)} (w_{ij} \sigma_{g,j}^\alpha)^2 + \epsilon \sum_{j \in N(i)} (1 - w_{ij})^2 \tag{6}$$

对 $w_{ij}$ 求偏导令其为零：

$$2 w_{ij} \sigma_{g,j}^{2\alpha} - 2\epsilon(1 - w_{ij}) = 0 \implies w_{ij} = \frac{\epsilon}{\sigma_{g,j}^{2\alpha} + \epsilon}$$

---

## 4. 空间高斯变体

加入空间高斯权重以限制平均范围：

$$w_{ij} = \exp\!\left(-\frac{\|p_i - p_j\|^2}{2\sigma_s^2}\right) \cdot \frac{\epsilon}{\sigma_{g,j}^{2\alpha} + \epsilon} \tag{7}$$

其中 $\sigma_s = |N(i)|/4$。

---

## 5. 算法流程

```
输入：引导图像 g，输入图像 x，窗口半径 r，参数 γ，α，ε
输出：滤波结果 x̂

// Step 1：标准 GIF 计算每个窗口的系数
1. mean_g = box_filter(g, r)
2. mean_x = box_filter(x, r)
3. var_g   = box_filter(g·g, r) - mean_g·mean_g
4. cov_gx  = box_filter(g·x, r) - mean_g·mean_x
5. a = cov_gx / (var_g + γ)
6. b = mean_x - a·mean_g

// Step 2：计算各向异性权重
7. w = ε / (var_g^α + ε)          // 式(5)，逐像素

// Step 3：加权平均
8. ã = box_filter_weighted(a, w, r)  // 式(1)
9. b̃ = box_filter_weighted(b, w, r)  // 式(2)
10. x̂ = ã·g + b̃                      // 式(3)
```

---

## 6. 与 GIF 的对比

| 特性 | GIF | AGF |
|------|-----|-----|
| 系数平均 | 均匀平均 | 各向异性加权平均 |
| 边缘处 | 跨边缘系数被平均（模糊） | 边缘处权重小，减少跨边缘平均 |
| 方向感知 | 无 | 有（通过 $\sigma_{g,j}^{2\alpha}$） |
| 额外参数 | — | $\alpha$（各向异性强度） |
| 复杂度 | $O(N)$ | $O(N)$ |
