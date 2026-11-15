import type { MetadataRoute } from "next";

// ส่วนผู้ดูแลและ API ไม่ให้ถูกค้นหา/จัดทำดัชนี
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] } };
}
