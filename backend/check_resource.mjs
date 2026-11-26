import cloudinary from "./config/cloudinary.js";
console.log('CLOUDINARY_API_KEY present:', !!process.env.CLOUDINARY_API_KEY);
const publicId = process.argv[2];
(async ()=>{
	try{
		if(publicId){
			const res = await cloudinary.api.resource(publicId, {resource_type:'raw'});
			console.log(JSON.stringify(res, null, 2));

			if(process.argv[3] === 'signed'){
				try{
					let format;
					try{ const m = publicId && publicId.match(/\.([a-z0-9]+)$/i); if(m) format = m[1]; }catch(e){}
					const timestamp = Math.floor(Date.now() / 1000);
					const stringToSign = `public_id=${publicId}&timestamp=${timestamp}`;
					const crypto = await import('crypto');
					const signature = crypto.createHmac('sha1', process.env.CLOUDINARY_API_SECRET).update(stringToSign).digest('hex');
					const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
					const apiKey = process.env.CLOUDINARY_API_KEY;
					const signed = `https://api.cloudinary.com/v1_1/${cloudName}/image/download?public_id=${encodeURIComponent(publicId)}&timestamp=${timestamp}&signature=${signature}&api_key=${apiKey}`;
					console.log('signed_url:', signed);
					try{
						const noExt = publicId.replace(/\.[a-z0-9]+$/i, '');
						if(noExt !== publicId){
							const signed2 = cloudinary.utils.private_download_url(noExt, opts);
							console.log('signed_url_no_ext:', signed2);
						}
					}catch(e){ console.error('no_ext_error', e && e.message ? e.message : e); }
				} catch(err){
					console.error('signed_url_error:', err && err.message ? err.message : err);
				}
			}

			return;
		}

		const list = await cloudinary.api.resources({ resource_type: 'raw', type: 'upload', prefix: 'documents', max_results: 50 });
		console.log('Found resources count:', list.resources.length);
		console.log(JSON.stringify(list.resources.map(r=>({ public_id: r.public_id, format: r.format, bytes: r.bytes, created_at: r.created_at })), null, 2));
	} catch(e){
		console.error('ERROR:', e && e.message ? e.message : e);
	}
})();
