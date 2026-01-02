import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import vegetablesImage from "@/assets/vegetables-basket.jpg";
import fruitsImage from "@/assets/fruits-display.jpg";
import riceImage from "@/assets/rice-field.jpg";

const categories = [
  {
    name: "Fresh Vegetables",
    description: "Tomatoes, potatoes, onions, leafy greens, and more",
    image: vegetablesImage,
    count: "5,000+ listings",
    href: "/marketplace?category=vegetables",
  },
  {
    name: "Seasonal Fruits",
    description: "Mangoes, bananas, apples, oranges, and tropical fruits",
    image: fruitsImage,
    count: "3,500+ listings",
    href: "/marketplace?category=fruits",
  },
  {
    name: "Grains & Cereals",
    description: "Rice, wheat, millets, pulses, and organic grains",
    image: riceImage,
    count: "2,800+ listings",
    href: "/marketplace?category=grains",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Browse by <span className="text-primary">Category</span>
            </h2>
            <p className="text-muted-foreground">
              Explore fresh produce across various categories
            </p>
          </div>
          <Link
            to="/marketplace"
            className="flex items-center gap-2 text-primary font-medium hover:underline"
          >
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={category.href}
              className="group animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card variant="elevated" className="overflow-hidden h-full">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-overlay" />
                  <span className="absolute bottom-4 left-4 text-sm font-medium text-background/90 bg-background/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    {category.count}
                  </span>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
