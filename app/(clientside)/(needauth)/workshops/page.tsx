import { GetActiveWorkshops } from "../../actions/workshops";
import { WorkshopCard } from "../../components/workcard"; // Assuming component is in same dir or adjust import
import { ArrowDown } from "lucide-react";

export default async function Workshops() {
  const workshops = await GetActiveWorkshops();

  // Styles
  const BG_BLACK = "bg-black";
  const BORDER_COLOR = "border-neutral-800";

  return (
    <div className={`min-h-screen ${BG_BLACK} text-white font-sans pt-24`}>
      {/* Background Grid Effect */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header Section */}
        <div className={`border-b ${BORDER_COLOR} pb-12`}>
          <div className="container mx-auto px-4">
            <h1 className="text-[10vw] leading-[0.85] font-black tracking-tighter uppercase">
              Workshops
              <span className="text-red-600">.</span>
            </h1>
            
            <div className="grid md:grid-cols-12 mt-12 border-t border-neutral-800 pt-6">
              <div className="col-span-12 md:col-span-6">
                <p className="text-xl text-neutral-400 font-light">
                  Purposeful, personalized coaching that delivers legit results.
                  Secure your spot for upcoming sessions.
                </p>
              </div>
              <div className="col-span-12 md:col-span-6 flex justify-start md:justify-end mt-6 md:mt-0">
                <div className="flex items-center gap-2 text-red-600">
                   <ArrowDown className="w-5 h-5 animate-bounce" />
                   <span className="uppercase tracking-widest text-xs font-bold">Select a Module</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listing Grid */}
        <div className="container mx-auto px-4 py-12">
          {workshops.length === 0 ? (
            <div className={`border border-dashed ${BORDER_COLOR} p-24 text-center`}>
              <p className="text-neutral-500 uppercase tracking-widest">No workshops scheduled at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {workshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}