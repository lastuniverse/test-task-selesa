import { unzip, Unzipped } from "fflate";

export async function unzipResponce(response: Response): Promise<Unzipped>{
  const buffer = await response.arrayBuffer();
  const zipData = new Uint8Array(buffer);
  return new Promise((resolve, reject)=>{
	unzip(zipData, (err, files) => {
	  if (err) {
		const error = new Error(`Ошибка при разархивировании: ${err}`);
		console.error("Ошибка при разархивировании:", err);
		reject(error);
		return;
	  }

	  resolve(files);
	});
  })
}