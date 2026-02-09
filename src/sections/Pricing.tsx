import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/Footer';
import PricingSection from '@/components/ui/pricing-section';

export default function Pricing({ onLogin, onRegister }: { onLogin?: () => void, onRegister?: () => void }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500">
            <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

            <main className="pt-20">
                <PricingSection />
            </main>

            <Footer />
        </div>
    );
}
