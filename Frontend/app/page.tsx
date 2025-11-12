import { AppLayout } from "@/components/layout/app-layout"
import { ScrollingBackground } from "@/components/retro/scrolling-background"
import { ArcadeButton } from "@/components/retro/arcade-button"
import { PixelCard } from "@/components/retro/pixel-card"
// ScrollingBackground removed to eliminate floating background objects
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Upload, FileText, Award } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <AppLayout>
      {/* Blue gradient background (decorations disabled) */}
      <ScrollingBackground showDecorations={false} />

      <div className="max-w-7xl mx-auto relative z-20">
        {/* Hero Section */}
        <section className="text-center py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 font-mono uppercase tracking-wider">
              {"PIXEL INTERVIEWS"} <br />
              <span className="text-black pixel-blink font-bold">{"LEVEL UP!"}</span>
            </h1>
            <p className="text-xl text-foreground text-pretty mb-8 max-w-2xl mx-auto font-mono">
              {
                "Enter the retro world of AI-powered interviews! Collect points, unlock achievements, and level up your hiring game in this nostalgic 90s experience."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ArcadeButton asChild size="lg" variant="primary">
                <Link href="/interview">
                  <Video className="mr-2 h-5 w-5" />
                  {"START GAME"}
                </Link>
              </ArcadeButton>
              <ArcadeButton asChild size="lg" variant="secondary">
                <Link href="/resume">
                  <Upload className="mr-2 h-5 w-5" />
                  {"UPLOAD DATA"}
                </Link>
              </ArcadeButton>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mono uppercase tracking-wider">
              {"POWER-UPS & FEATURES"}
            </h2>
            <p className="text-xl text-foreground max-w-2xl mx-auto font-mono">
              {"Unlock special abilities and boost your interview skills with these retro features!"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PixelCard className="text-center" variant="primary">
              <CardHeader>
                <div className="w-12 h-12 bg-primary pixel-border flex items-center justify-center mx-auto mb-4">
                  <Video className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="font-mono uppercase">{"VIDEO POWER-UP"}</CardTitle>
                <CardDescription className="font-mono">
                  {"Activate real-time video interviews with AI-generated questions and instant analysis boost!"}
                </CardDescription>
              </CardHeader>
            </PixelCard>

            <PixelCard className="text-center" variant="secondary">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary pixel-border flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="font-mono uppercase">{"DATA SCANNER"}</CardTitle>
                <CardDescription className="font-mono">
                  {"Upload resume files and watch our AI extract skills and experience with pixel-perfect precision!"}
                </CardDescription>
              </CardHeader>
            </PixelCard>

            <PixelCard className="text-center" variant="accent">
              <CardHeader>
                <div className="w-12 h-12 bg-accent pixel-border flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="font-mono uppercase">{"ACHIEVEMENT REPORTS"}</CardTitle>
                <CardDescription className="font-mono">
                  {"Generate detailed score reports with recommendations and unlock downloadable PDF achievements!"}
                </CardDescription>
              </CardHeader>
            </PixelCard>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16">
          <PixelCard className="p-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mono uppercase tracking-wider">
                {"GAME WALKTHROUGH"}
              </h2>
              <p className="text-xl text-foreground max-w-2xl mx-auto font-mono">
                {"Master the interview game in just three simple levels!"}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary pixel-border flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary-foreground font-mono">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 font-mono uppercase">{"LOAD DATA"}</h3>
                <p className="text-foreground font-mono">
                  {
                    "Upload candidate resume and let our retro AI scanner extract all the important stats and abilities!"
                  }
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary pixel-border flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-secondary-foreground font-mono">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 font-mono uppercase">{"START BATTLE"}</h3>
                <p className="text-foreground font-mono">
                  {"Begin the video interview challenge with AI-generated questions tailored to player background!"}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent pixel-border flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-accent-foreground font-mono">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 font-mono uppercase">{"COLLECT REWARDS"}</h3>
                <p className="text-foreground font-mono">
                  {"Receive detailed analysis with high scores, power-up recommendations, and unlock PDF certificates!"}
                </p>
              </div>
            </div>
          </PixelCard>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <PixelCard className="p-6" variant="primary">
              <div className="text-4xl font-bold text-primary mb-2 font-mono">{"500+"}</div>
              <div className="text-foreground font-mono uppercase text-sm">{"Games Played"}</div>
            </PixelCard>
            <PixelCard className="p-6" variant="secondary">
              <div className="text-4xl font-bold text-secondary mb-2 font-mono">{"95%"}</div>
              <div className="text-foreground font-mono uppercase text-sm">{"Success Rate"}</div>
            </PixelCard>
            <PixelCard className="p-6" variant="accent">
              <div className="text-4xl font-bold text-accent mb-2 font-mono">{"50%"}</div>
              <div className="text-foreground font-mono uppercase text-sm">{"Time Bonus"}</div>
            </PixelCard>
            <PixelCard className="p-6">
              <div className="text-4xl font-bold text-primary mb-2 font-mono">{"24/7"}</div>
              <div className="text-foreground font-mono uppercase text-sm">{"Online"}</div>
            </PixelCard>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center">
          <PixelCard className="max-w-2xl mx-auto" variant="accent">
            <CardContent className="pt-8">
              <h2 className="text-3xl font-bold mb-4 font-mono uppercase tracking-wider">{"READY TO PLAY?"}</h2>
              <p className="text-foreground mb-6 font-mono">
                {
                  "Join hundreds of players using Pixel Interview to level up their hiring game and discover the best candidates faster!"
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ArcadeButton asChild size="lg" variant="primary">
                  <Link href="/interview">{"START YOUR FIRST GAME"}</Link>
                </ArcadeButton>
                <ArcadeButton asChild size="lg" variant="secondary">
                  <Link href="/resume">{"UPLOAD RESUME"}</Link>
                </ArcadeButton>
              </div>
            </CardContent>
          </PixelCard>
        </section>
      </div>
    </AppLayout>
  )
}
