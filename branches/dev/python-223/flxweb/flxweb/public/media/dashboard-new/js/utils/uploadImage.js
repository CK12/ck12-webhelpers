import {fileUploadService} from 'services';

export const validateImage = (file)=>{
    if(file){
	        let  fileType = file.name.substring(file.name.lastIndexOf('.') + 1);
	          if((fileType == "gif")||(fileType == "jpg")||(fileType == "png")||(fileType == "JPG")||(fileType == "PNG")||(fileType == "jpeg")||(fileType == "JPEG")){
	        	  return {valid:true}
	          }else{
	        	  return {valid:false}
	          }
           }
}
export const uploadImage = (file,cb)=>{
	
	var formData = new FormData();
	var timeStamp = new Date().getTime();
	formData.append('resourceType', 'image');
	formData.append('resourceName',file.name);
	formData.append('resourcePath', file, `${timeStamp}_${file.name}`);
	
	fileUploadService.uploadResource(formData)
	.then((response)=>{
		cb(response);
	}).
	catch((err)=>{
		console.log(err) 
	});

}
export default {
	validateImage,
	uploadImage
}