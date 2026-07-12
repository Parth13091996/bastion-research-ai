import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, Check, ExternalLink, Sparkles, Zap, 
  HelpCircle, Play, Info, Gift, Star, TrendingUp 
} from "lucide-react";
import { toast } from "sonner";
import useConstants from "@/hooks/use-constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const EffortlessInvestor: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const code = "CORECOMMUNITY";
  const { BrandColors } = useConstants();

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  const faqs = [
    {
      q: "Who is this for?",
      a: "Investors looking for high-conviction, asymmetric opportunities with a focus on fundamental growth.",
    },
    {
      q: "How do I use the coupon?",
      a: "Copy the code and apply it during the smallcase checkout process to redeem your exclusive discount.",
    },
    {
      q: "Is this available for non-premium users?",
      a: "No. This benefit is reserved exclusively for Bastion premium members as a token of appreciation.",
    },
    {
      q: "How often is the portfolio updated?",
      a: "The portfolio is updated dynamically based on investment opportunities identified by Bastion Research.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* HERO SECTION */}
      <div 
        className="relative overflow-hidden pt-12 pb-20 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${BrandColors.blue} 0%, #1e293b 100%)` 
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 -right-24 w-64 h-64 rounded-full bg-white blur-2xl opacity-10"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-4xl text-center relative z-10"
        >
          <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-md px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
            Exclusive Premium Benefit
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            Effortless <span className="text-[#3b82f6]">Investing</span>, Elevated Results
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Unlock high-conviction asymmetric opportunities curated by Bastion Research at an exclusive member rate.
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-12 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-10"
        >
          {/* OFFER CARD */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-none shadow-2xl bg-white rounded-3xl group">
              <div className="flex flex-col md:flex-row">
                {/* Left side: Offer details */}
                <div className="p-8 md:p-10 flex-1 border-r border-gray-100">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                       <div className="p-2 bg-blue-50 rounded-lg">
                         <TrendingUp className="h-5 w-5 text-blue-600" />
                       </div>
                       <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Smallcase Portfolio</span>
                    </div>

                    <div>
                      <h2 className="text-3xl font-black text-[#1C2852] mb-2 leading-tight">
                        Asymmetric Growth Fundamental
                      </h2>
                      <p className="text-gray-500 text-sm font-medium">
                        Strategically curated for high-impact long-term wealth creation.
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-gray-400 line-through text-sm font-bold">Rs. 9,999</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-[#1C2852]">Rs. 4,999</span>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-md px-2 py-0.5 font-black text-[10px]">
                            SAVE 50%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <a
                        href="https://bastionresearch.smallcase.com/smallcase/BAREFMM_0001"
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <Button
                          className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all text-white"
                          style={{ backgroundColor: BrandColors.blue }}
                        >
                          View Portfolio <ExternalLink className="ml-2 h-5 w-5" />
                        </Button>
                      </a>

                      <a
                        href="https://bastionresearch.smallcase.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <Button
                          variant="outline"
                          className="w-full h-14 text-lg font-bold border-2 rounded-2xl hover:bg-gray-50 transition-all text-gray-700"
                        >
                          Open on smallcase
                        </Button>
                      </a>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-1 px-4 bg-red-50 rounded-full w-fit">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <p className="text-[11px] font-bold text-red-600 uppercase tracking-tighter">
                        70% of premium slots filled
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side: Coupon Section */}
                <div className="bg-[#FAFBFD] p-8 md:p-10 md:w-80 flex flex-col justify-center items-center text-center">
                  <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <Gift className="h-10 w-10 text-blue-500 mb-2 mx-auto" strokeWidth={1.5} />
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Member Exclusive</p>
                  </div>
                  
                  <h3 className="text-xl font-black text-[#1C2852] mb-4">Your Promo Code</h3>
                  
                  {/* Voucher UI */}
                  <div className="w-full relative py-6 px-4 bg-white border-2 border-dashed border-blue-200 rounded-2xl mb-6 overflow-hidden">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FAFBFD] rounded-full border-r-2 border-blue-200"></div>
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FAFBFD] rounded-full border-l-2 border-blue-200"></div>
                    
                    <div className="text-3xl font-black tracking-[0.25em] text-blue-600 mb-1">
                      {code}
                    </div>
                    <p className="text-[10px] text-blue-400 font-bold uppercase">Apply @ Checkout</p>
                  </div>

                  <Button
                    onClick={copyCode}
                    className="w-full h-12 font-bold rounded-xl transition-all active:scale-95 text-sm"
                    style={{ backgroundColor: BrandColors.blue }}
                  >
                    {copied ? (
                      <><Check className="mr-2 h-4 w-4" /> Copied</>
                    ) : (
                      <><Copy className="mr-2 h-4 w-4" /> Copy Code</>
                    )}
                  </Button>
                  
                  <p className="mt-4 text-[10px] text-gray-400 font-medium">
                    Valid for one-time use on smallcase platform.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ABOUT SECTION */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card className="border-none shadow-xl bg-white rounded-3xl h-full overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-100 rounded-md">
                      <Play className="h-4 w-4 text-blue-700 fill-blue-700" />
                    </div>
                    <CardTitle className="text-xl font-black text-[#1C2852]">Strategy Deep Dive</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium mb-6">
                    A high-conviction portfolio targeting asymmetric, mispriced opportunities below Rs. 10,000 Cr market capitalization.
                  </p>

                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-900 border-4 border-white">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/Lo_18njrxEE?si=MIo9vC0L2Aj8ZL64&mute=1"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* FAQ SECTION */}
            <motion.div variants={itemVariants} className="md:col-span-1">
               <Card className="border-none shadow-xl bg-white rounded-3xl h-full overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-orange-100 rounded-md">
                      <HelpCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl font-black text-[#1C2852]">Quick FAQs</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-100 last:border-0">
                        <AccordionTrigger className="text-left py-3 hover:no-underline font-bold text-[#1C2852] text-sm hover:text-blue-600">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-gray-500 leading-relaxed font-medium">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  
                  <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-700 mb-1">Still have questions?</p>
                        <p className="text-[11px] text-gray-500 font-medium">Reach out to our support team for specialized assistance.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center"
          >
            <div className="mb-4 text-yellow-500">
              <Star className="h-8 w-8 fill-yellow-500" />
            </div>
            <h4 className="text-lg font-black text-[#1C2852] mb-2">Premium Member Guarantee</h4>
            <p className="text-sm text-gray-500 max-w-lg mb-0 font-medium leading-relaxed">
              We stand by our research. This access is granted to ensure our long-term members have the best tools to achieve their financial goals.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default EffortlessInvestor;
