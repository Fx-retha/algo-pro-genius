import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is Code Base Algo Pro itself a trading robot or EA?",
    answer: "No, Code Base Algo Pro is not a trading robot or EA. It is a trade synchronization platform that allows mentors to share their trades with clients in real-time. The actual trading decisions are made by the mentors.",
  },
  {
    question: "Which brokers does Code Base Algo Pro work with?",
    answer: "Code Base Algo Pro is compatible with virtually any MT4 or MT5 broker worldwide. Our universal integration ensures seamless connectivity regardless of your broker choice.",
  },
  {
    question: "How can I get access to a license key?",
    answer: "License keys are provided upon subscription. Simply sign up for a mentor or client account, choose your subscription plan, and your license key will be automatically generated and sent to your registered email.",
  },
  {
    question: "What is a mentor verification code and where do I use it?",
    answer: "A mentor verification code is a unique identifier provided by a mentor to their clients. You enter this code during the app setup to link your account to your chosen mentor and start receiving their trade signals.",
  },
  {
    question: "Do stop loss and take profit changes sync to client accounts?",
    answer: "Yes, absolutely! Any modifications to stop loss or take profit levels made by the mentor are automatically synchronized to all connected client accounts in real-time, ensuring everyone stays aligned.",
  },
];

const FAQSection = () => {
  return (
    <section id="mentors" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Frequently Asked <span className="text-primary text-glow">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about Code Base Algo Pro
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="glass-card rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="font-display text-lg text-left hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
