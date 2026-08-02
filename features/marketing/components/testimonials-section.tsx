"use client";


const testimonials = [
  {
    name: "Aryan S.",
    role: "AIR 142, JEE Advanced",
    content: "JEE Pro completely changed how I track my progress. The analytics showed me exactly where I was losing marks in Physics.",
  },
  {
    name: "Neha K.",
    role: "AIR 890, JEE Main",
    content: "The clean interface meant I spent zero time trying to figure out the app, and 100% of my time actually studying.",
  },
  {
    name: "Rohan M.",
    role: "Dropper to IIT Delhi",
    content: "The mock tests feel exactly like the real exam. Having an Apple-like experience while studying reduces so much stress.",
  },
  {
    name: "Priya V.",
    role: "AIR 45, JEE Advanced",
    content: "Minimalist, fast, and no distractions. This is what every JEE aspirant needs instead of chaotic WhatsApp groups.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 overflow-hidden bg-card/20 border-y border-border/50" id="testimonials">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-16 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Trusted by top rankers.</h2>
      </div>

      <div className="relative flex overflow-x-hidden w-full group">
        <div className="animate-marquee flex gap-6 px-6 whitespace-nowrap min-w-full">
          {testimonials.map((t, idx) => (
            <div
              key={`${t.name}-${idx}`}
              className="inline-block w-80 sm:w-96 rounded-2xl border border-border/50 bg-background/50 p-6 backdrop-blur-xl shrink-0"
            >
              <div className="flex flex-col gap-4 whitespace-normal">
                <p className="text-muted leading-relaxed">&quot;{t.content}&quot;</p>
                <div>
                  <h4 className="font-medium text-foreground">{t.name}</h4>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="animate-marquee flex gap-6 px-6 whitespace-nowrap min-w-full absolute top-0" aria-hidden="true" style={{ left: "100%" }}>
          {testimonials.map((t, idx) => (
            <div
              key={`${t.name}-dup-${idx}`}
              className="inline-block w-80 sm:w-96 rounded-2xl border border-border/50 bg-background/50 p-6 backdrop-blur-xl shrink-0"
            >
              <div className="flex flex-col gap-4 whitespace-normal">
                <p className="text-muted leading-relaxed">&quot;{t.content}&quot;</p>
                <div>
                  <h4 className="font-medium text-foreground">{t.name}</h4>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
