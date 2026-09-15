const number = "91 00000 00000";
const cleaned = number.replace(/\D/g, "");
const message =
  "Hi! I am interested in the Rainbow Bead Bracelet from Jaswitha & Sathvika Little Craft Studio. Price: ₹150. Is it available?";
const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;

const demo = [
  { id: "1", name: "Available Flower", status: "AVAILABLE", featured: false },
  { id: "2", name: "Sold Hidden", status: "SOLD", featured: true },
];
const publicList = demo.filter((product) => product.status === "AVAILABLE");
const featuredPublic = publicList.filter((product) => product.featured);

console.log(JSON.stringify({
  whatsappUrl: url,
  encodedRupee: url.includes(encodeURIComponent("₹150")),
  queryHasNoRawSpaces: !url.split("?text=")[1].includes(" "),
  publicCount: publicList.length,
  soldHidden: !publicList.some((product) => product.name === "Sold Hidden"),
  featuredSoldHidden: featuredPublic.length === 0,
}, null, 2));
