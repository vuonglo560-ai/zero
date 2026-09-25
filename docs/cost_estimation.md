# 💰 DỰ TOÁN CHI PHÍ TRIỂN KHAI CLOUD - SPENDWISE PERSONAL

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 25/09/2026  
**Loại ứng dụng:** Personal Finance Management Web App

---

## 📊 TỔNG QUAN

Dự án SpendWise Personal có thể triển khai hoàn toàn **MIỄN PHÍ** cho mục đích demo/đồ án, hoặc nâng cấp lên các gói trả phí cho production với nhiều người dùng.

---

## 🆓 PHƯƠNG ÁN 1: FREE TIER (ĐỒ ÁN / POC)

### **1.1. Frontend Hosting**

| Dịch vụ | Cấu hình | Băng thông | Chi phí |
|---------|----------|------------|---------|
| **Vercel** | Unlimited deployments | 100GB/tháng | **$0.00** |
| **Cloudflare Pages** | Unlimited sites | Unlimited | **$0.00** |
| **Netlify** | 100GB bandwidth | 100GB/tháng | **$0.00** |

**Đề xuất:** Vercel (tích hợp GitHub tốt nhất)

---

### **1.2. Backend & API**

| Dịch vụ | RAM | CPU | Giờ hoạt động | Chi phí |
|---------|-----|-----|---------------|---------|
| **Render Free** | 512MB | 0.1 vCPU | 750 giờ/tháng | **$0.00** |
| **Railway Trial** | 512MB | Shared | $5 credit | **$0.00** (3-5 ngày) |
| **Fly.io Free** | 256MB | Shared | 3 VMs | **$0.00** |
| **Koyeb Free** | 512MB | Shared | 1 service | **$0.00** |

**Đề xuất:** Render (ổn định nhất, 750h đủ chạy 24/7)

**⚠️ Lưu ý Render Free Tier:**
- App "ngủ" sau 15 phút không hoạt động
- Khởi động lại mất ~30 giây
- Đủ cho demo và nộp đồ án

---

### **1.3. Database**

| Dịch vụ | Loại DB | Storage | Kết nối | Chi phí |
|---------|---------|---------|---------|---------|
| **SQLite** (hiện tại) | File-based | 1GB | Unlimited | **$0.00** |
| **Supabase Free** | PostgreSQL | 500MB | 500MB/tháng | **$0.00** |
| **Neon Free** | PostgreSQL | 3GB | 100h compute/tháng | **$0.00** |
| **PlanetScale Free** | MySQL | 5GB | 1 database | **$0.00** |

**Đề xuất:** SQLite (đơn giản, không cần setup) hoặc Supabase (nếu cần PostgreSQL)

---

### **1.4. Cloud Storage**

| Dịch vụ | Dung lượng | Bandwidth | Chi phí |
|---------|------------|-----------|---------|
| **Supabase Storage** | 1GB | 2GB/tháng | **$0.00** |
| **Cloudinary Free** | 25GB | 25GB/tháng | **$0.00** |
| **AWS S3 Free Tier** | 5GB | 15GB/tháng (12 tháng) | **$0.00** |

**Đề xuất:** Supabase Storage (nếu dùng Supabase DB)

---

### **1.5. Domain & SSL**

| Mục | Nhà cung cấp | Chi phí |
|-----|--------------|---------|
| **Subdomain** | `.onrender.com` / `.vercel.app` | **$0.00** |
| **SSL Certificate** | Let's Encrypt (tự động) | **$0.00** |

---

### **1.6. Monitoring & Logs**

| Dịch vụ | Tính năng | Chi phí |
|---------|-----------|---------|
| **Render Logs** | Built-in logging | **$0.00** |
| **BetterStack Free** | Uptime monitoring | **$0.00** |
| **UptimeRobot Free** | 50 monitors | **$0.00** |

---

### **📊 TỔNG CHI PHÍ PHƯƠNG ÁN 1 (FREE TIER)**

```
┌─────────────────────────────┬──────────────┐
│ Frontend (Vercel)           │    $0.00     │
│ Backend (Render)            │    $0.00     │
│ Database (SQLite)           │    $0.00     │
│ Storage (Supabase)          │    $0.00     │
│ Domain (.onrender.com)      │    $0.00     │
│ SSL (Let's Encrypt)         │    $0.00     │
│ Monitoring (BetterStack)    │    $0.00     │
├─────────────────────────────┼──────────────┤
│ TỔNG CỘNG / THÁNG           │   $0.00 USD  │
│                             │   0 VNĐ      │
└─────────────────────────────┴──────────────┘
```

**✅ Phù hợp cho:**
- Đồ án tốt nghiệp
- Demo MVP
- Personal projects
- Portfolio
- Testing & Development

---

## 💼 PHƯƠNG ÁN 2: STARTER TIER (SẢN PHẨM NHỎ - 100 USERS)

### **2.1. Cấu hình**

| Thành phần | Dịch vụ | Cấu hình | Chi phí/tháng |
|------------|---------|----------|---------------|
| **Frontend CDN** | Cloudflare Pro | DDoS protection + WAF | $20.00 |
| **Backend** | Render Starter | 1GB RAM, 1 vCPU | $7.00 |
| **Database** | Supabase Pro | 8GB storage, daily backup | $25.00 |
| **Storage** | Supabase Pro | 100GB storage | (included) |
| **Domain** | Namecheap .com | Custom domain | $1.00 |
| **Monitoring** | BetterStack | Basic monitoring | $0.00 |

### **📊 TỔNG CHI PHÍ PHƯƠNG ÁN 2**

```
┌─────────────────────────────┬──────────────┐
│ Cloudflare Pro              │   $20.00     │
│ Render Starter              │    $7.00     │
│ Supabase Pro                │   $25.00     │
│ Domain (.com)               │    $1.00     │
├─────────────────────────────┼──────────────┤
│ TỔNG CỘNG / THÁNG           │  $53.00 USD  │
│                             │  ~1.325.000  │
│                             │  VNĐ         │
└─────────────────────────────┴──────────────┘
```

**✅ Phù hợp cho:**
- Startup nhỏ
- 100-500 người dùng
- Doanh nghiệp vừa và nhỏ
- Sản phẩm thương mại nhỏ

---

## 🚀 PHƯƠNG ÁN 3: PRODUCTION TIER (10,000 USERS)

### **3.1. Cấu hình**

| Thành phần | Dịch vụ | Cấu hình | Chi phí/tháng |
|------------|---------|----------|---------------|
| **Frontend CDN** | Cloudflare Pro | Global CDN + WAF | $20.00 |
| **Backend Cluster** | Render Standard (x2) | 2GB RAM, 2 vCPU x2 instances | $50.00 |
| **Database** | AWS RDS PostgreSQL | Multi-AZ, 20GB storage | $35.00 |
| **Storage** | AWS S3 + CloudFront | 100GB storage + CDN | $15.00 |
| **Cache Layer** | Redis Cloud | 1GB cache | $7.00 |
| **Domain** | Custom .com | Premium domain | $1.00 |
| **Monitoring** | Datadog | APM + Logs | $15.00 |
| **Backup** | AWS S3 Glacier | Daily automated backup | $3.00 |

### **📊 TỔNG CHI PHÍ PHƯƠNG ÁN 3**

```
┌─────────────────────────────┬──────────────┐
│ Cloudflare Pro              │   $20.00     │
│ Render Standard x2          │   $50.00     │
│ AWS RDS PostgreSQL          │   $35.00     │
│ AWS S3 + CloudFront         │   $15.00     │
│ Redis Cloud                 │    $7.00     │
│ Custom Domain               │    $1.00     │
│ Datadog Monitoring          │   $15.00     │
│ AWS S3 Glacier Backup       │    $3.00     │
├─────────────────────────────┼──────────────┤
│ TỔNG CỘNG / THÁNG           │ $146.00 USD  │
│                             │ ~3.650.000   │
│                             │ VNĐ          │
└─────────────────────────────┴──────────────┘
```

**✅ Phù hợp cho:**
- Doanh nghiệp vừa
- 5,000-20,000 người dùng
- Yêu cầu uptime 99.9%
- Compliance & Security standards

---

## 📈 PHƯƠNG ÁN 4: ENTERPRISE TIER (100,000+ USERS)

### **4.1. Cấu hình**

| Thành phần | Dịch vụ | Cấu hình | Chi phí/tháng |
|------------|---------|----------|---------------|
| **Frontend CDN** | Cloudflare Business | Advanced DDoS + WAF | $200.00 |
| **Backend** | AWS ECS Fargate | 4 vCPU, 8GB RAM x4 tasks | $250.00 |
| **Load Balancer** | AWS ALB | Application Load Balancer | $25.00 |
| **Database** | AWS RDS Multi-AZ | 4 vCPU, 16GB RAM, 500GB | $300.00 |
| **Cache** | AWS ElastiCache | Redis 16GB cluster | $100.00 |
| **Storage** | AWS S3 + CloudFront | 1TB + global CDN | $50.00 |
| **Monitoring** | Datadog Enterprise | Full APM + Security | $100.00 |
| **WAF & Security** | AWS WAF + Shield | DDoS protection | $50.00 |
| **Backup & DR** | AWS Backup | Automated multi-region | $30.00 |

### **📊 TỔNG CHI PHÍ PHƯƠNG ÁN 4**

```
┌─────────────────────────────┬──────────────┐
│ Cloudflare Business         │  $200.00     │
│ AWS ECS Fargate             │  $250.00     │
│ AWS ALB                     │   $25.00     │
│ AWS RDS Multi-AZ            │  $300.00     │
│ AWS ElastiCache Redis       │  $100.00     │
│ AWS S3 + CloudFront         │   $50.00     │
│ Datadog Enterprise          │  $100.00     │
│ AWS WAF + Shield            │   $50.00     │
│ AWS Backup                  │   $30.00     │
├─────────────────────────────┼──────────────┤
│ TỔNG CỘNG / THÁNG           │$1,105.00 USD │
│                             │~27.625.000   │
│                             │VNĐ           │
└─────────────────────────────┴──────────────┘
```

**✅ Phù hợp cho:**
- Enterprise lớn
- 50,000-500,000 người dùng
- SLA 99.99% uptime
- Compliance: SOC2, ISO27001

---

## 🔄 SO SÁNH CÁC PHƯƠNG ÁN

| Tiêu chí | Free Tier | Starter | Production | Enterprise |
|----------|-----------|---------|------------|------------|
| **Chi phí/tháng** | $0 | $53 | $146 | $1,105 |
| **Số người dùng** | < 50 | 100-500 | 5K-20K | 50K-500K |
| **Uptime** | ~95% | 99% | 99.9% | 99.99% |
| **Cold start** | Có (30s) | Không | Không | Không |
| **Backup** | Thủ công | Daily | Hourly | Real-time |
| **Support** | Community | Email | 24/7 Chat | Dedicated |
| **Scaling** | Manual | Auto (basic) | Auto | Auto + Custom |

---

## 💡 ĐỀ XUẤT CHO DỰ ÁN

### **Cho Đồ án / Báo cáo Buổi 4:**
✅ **PHƯƠNG ÁN 1: FREE TIER**
- Chi phí: **$0 / tháng**
- Đủ để demo và nộp báo cáo
- Chạy ổn định với < 50 users
- Setup nhanh trong 5-10 phút

### **Khi chuyển thành sản phẩm thật:**
✅ **PHƯƠNG ÁN 2: STARTER TIER**
- Chi phí: **$53 / tháng** (~1.3 triệu VNĐ)
- Không có cold start
- Backup tự động
- Hỗ trợ 100-500 users

---

## 📊 CHI TIẾT BREAKDOWN (PHƯƠNG ÁN HIỆN TẠI - FREE)

```
Frontend:
  Vercel hosting:              $0.00
  100GB bandwidth:             $0.00
  SSL certificate:             $0.00
  Custom domain (.vercel.app): $0.00
                              -------
  Subtotal Frontend:           $0.00

Backend:
  Render web service:          $0.00
  512MB RAM, 0.1 vCPU:         $0.00
  750 hours/month:             $0.00
                              -------
  Subtotal Backend:            $0.00

Database:
  SQLite file storage:         $0.00
  (included in container)
                              -------
  Subtotal Database:           $0.00

Additional Services:
  Monitoring (BetterStack):    $0.00
  Logs (Render built-in):      $0.00
  GitHub repository:           $0.00
                              -------
  Subtotal Additional:         $0.00

═══════════════════════════════════════
GRAND TOTAL:                   $0.00/mo
                              (0 VNĐ)
═══════════════════════════════════════
```

---

## 🎯 KẾT LUẬN

Dự án SpendWise Personal có thể **triển khai hoàn toàn miễn phí** cho mục đích đồ án và demo. Khi cần scale lên production, chi phí khởi điểm chỉ **$53/tháng** (~1.3 triệu VNĐ) cho 100-500 người dùng.

**Chi phí theo thời gian:**
- **Tháng 1-3:** $0 (Free tier - Demo)
- **Tháng 4-12:** $53 (Starter - Khi có users thật)
- **Năm 2+:** $146 (Production - Khi scale lên 10K users)

**ROI (Return on Investment):**
- Development cost: ~$0 (sử dụng open source)
- Infrastructure cost Year 1: ~$636 ($53 x 12 tháng)
- Potential revenue từ 500 users: ~$2,500/tháng (giả sử $5/user/month)
- **Break-even:** Tháng thứ 2

---

*Cập nhật lần cuối: 25/09/2026*  
*Tỷ giá quy đổi: 1 USD = 25,000 VNĐ*
