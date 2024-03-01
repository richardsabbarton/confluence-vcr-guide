function get(url){
    return new Promise((resolve, reject)=>{
      const xhr = new XMLHttpRequest()
      xhr.open("GET", url);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = (e) => {
        if(e.currentTarget.readyState == 4){
          resolve(xhr.responseText)
        }
      }
      xhr.onerror = (e) => {
        reject(e)
      }
      xhr.send()
    })
}

export {get}

