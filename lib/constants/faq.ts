export interface FaqItem {
  question: string;
  answer: string;
}

export function getStoreFaq(storeName: string, offerCount: number): FaqItem[] {
  return [
    {
      question: `How do I apply a ${storeName} promo code?`,
      answer: `To use a promo code for ${storeName}, copy the discount code from CouponCreek, head to ${storeName}'s official website, and paste it into the promo code or coupon field during checkout. Your order total will automatically update.`,
    },
    {
      question: `Are the ${storeName} coupons on CouponCreek free and verified?`,
      answer: `Yes, all ${storeName} promo codes and deals on CouponCreek are 100% free to use. Our team tests and verifies available offers regularly to ensure you get active savings.`,
    },
    {
      question: `Why is my ${storeName} promo code not working?`,
      answer: `Promo codes may fail if they have expired, require a minimum spend amount, or apply only to specific product categories. Always check the terms listed on the deal card or try another active offer from our list.`,
    },
    {
      question: `How many active offers are available for ${storeName} right now?`,
      answer: `Currently, CouponCreek features ${offerCount} active offer${offerCount === 1 ? "" : "s"} and promo codes for ${storeName}.`,
    },
  ];
}