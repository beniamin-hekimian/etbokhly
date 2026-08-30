import { Star } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Reveal } from "@/components/reveal";

const TESTIMONIALS_DATA = [
  {
    id: "1",
    quote:
      "غيّر اطبخلي نمط طعامِنا في المنزل بشكل كامل. طعمُ يخنةِ الشيف سميرة تماماً كطعمِ طعامِ جدّتي، لم أتوقّع شيئاً كهذا من تطبيق!",
    author: "لينا سليمان",
    initials: "ل.س",
    verifiedTag: "✓ عميلة موثّقة",
    avatarBg: "bg-primary",
    rating: 5,
  },
  {
    id: "2",
    quote:
      "أنا موظفٌ ودوامي طويل، وأقول بصراحة إنّني أجد طعاماً منزلياً حقيقياً يُوصَل إليّ حتى باب منزلي، وقد غيّر ذلك حياتي اليومية. كلُّ طبقٍ أشعر أنّه مُحضَّرٌ بمحبة.",
    author: "باسل الشامي",
    initials: "ب.ش",
    verifiedTag: "✓ عميل موثّق",
    avatarBg: "bg-secondary",
    rating: 5,
  },
  {
    id: "3",
    quote:
      "أجمل ما في الأمر أنّني أعرف بالضبط من الذي أعدَّ لي طعامي. أصبحت شيش برك الشيف أبو عمر عادةً أسبوعيةً لدينا في المنزل.",
    author: "رهف النجار",
    initials: "ر.ن",
    verifiedTag: "✓ عميلة موثّقة",
    avatarBg: "bg-amber-500",
    rating: 5,
  },
];

export function Testimonials() {
  const { t } = useTranslation();

  return (
    <section className="py-12 md:py-16" id="testimonials">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Head */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center mb-12">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              {t.testimonials.eyebrow}
            </span>
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">{t.testimonials.title}</h2>
            <p className="mt-3 text-base text-muted-foreground">{t.testimonials.description}</p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {TESTIMONIALS_DATA.map((item) => (
              <article
                key={item.id}
                dir="rtl"
                className="relative flex flex-col justify-between rounded-3xl border border-border/60 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md text-right"
              >
                <div>
                  {/* Header: Stars & Left-aligned Quote Mark */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="h-4.5 w-4.5 fill-primary text-primary" />
                      ))}
                    </div>
                    <span className="font-serif text-5xl font-black text-primary/20 leading-none select-none pointer-events-none">
                      “
                    </span>
                  </div>

                  {/* Testimonial Quote - Enhanced spacing and line-height */}
                  <p className="mb-8 text-base font-normal leading-loose tracking-wide text-foreground/90">
                    {item.quote}
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3.5 pt-2 border-t border-border/30">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.avatarBg} text-sm font-bold text-white shadow-xs`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground leading-snug">{item.author}</h4>
                    <span className="text-xs font-bold text-secondary">{item.verifiedTag}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
