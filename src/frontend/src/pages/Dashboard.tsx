import Page from "../components/Page";

export default function Dashboard(){
  return (
    <Page>
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl shadow px-6 py-4 text-center text-slate-700">
          Dobrodošli na nadzorni plošči.
        </div>
      </div>
    </Page>
  );
}