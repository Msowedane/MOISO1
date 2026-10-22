import { motion } from "framer-motion";
import {
    CreditCard,
    Landmark,
    CheckCircle2,
} from "lucide-react";

const CreditToBank = () => {
    return (
        <div className="flex min-h-80 w-full max-w-xl flex-col items-center justify-center overflow-hidden p-5 text-white sm:p-8">
            <div className="relative flex w-full max-w-md items-center justify-between">

                {/* Credit card */}
                <div className="z-10 flex h-24 w-28 flex-col items-center justify-center rounded-xl border border-[#d6c2eb] bg-[#eadcf7] text-[#51366f] shadow-lg shadow-violet-950/15">
                    <CreditCard size={36} />
                    <span className="mt-2 text-sm font-medium">
                        CREDIT
                    </span>
                </div>

                {/* Animated transfer path */}
                <div className="absolute left-24 right-24 top-1/2 h-1  overflow-hidden rounded-full">
                    <motion.div
                        className="h-full origin-left rounded-full bg-[#8b7cf6]"
                        animate={{ scaleX: [0, 1, 0] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </div>

                {/* Moving rupee coin */}
                <motion.div
                    className="absolute top-[calc(50%-1.25rem)] z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#8b7cf6] bg-[#8b7cf6] text-lg font-bold text-white shadow-md shadow-violet-950/20"
                    animate={{
                        left: ["28%", "72%"],
                        x: "-50%",
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    ₹
                </motion.div>

                {/* Destination bank */}
                <div className="z-10 flex h-24 w-28 flex-col items-center justify-center rounded-xl border border-[#c5c9e7] bg-[#dce0f5] text-[#41416f] shadow-lg shadow-violet-950/15">
                    <Landmark size={36} />
                    <span className="mt-2 text-sm font-medium">
                        BANK
                    </span>
                </div>
            </div>

            {/* Transfer status */}
            <motion.div
                className="mt-12 flex items-center gap-2 text-[#51366f]"
            >
                <CheckCircle2 size={22} />
                <span className="font-medium text_color">
                    Credit to Bank Transfer
                </span>
            </motion.div>
        </div>
    );
};

export default CreditToBank;