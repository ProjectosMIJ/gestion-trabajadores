import { Card, CardContent } from "../ui/card";

export default function Loading() {
  return (
    <>
      <Card>
        <CardContent>
          <div className="relative w-60 h-60 m-auto flex items-center justify-center">
            <div className="absolute inset-2 rounded-full border-b-2 border-blue-500 animate-spin"></div>
            <div className="absolute inset-7 rounded-full border-t-2 border-red-500 animate-spin direction-[reverse] animation-duration-[0.8s]"></div>
            <div className="text-lg text-gray-500 animate-pulse">
              Ejecutando Operacion
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
