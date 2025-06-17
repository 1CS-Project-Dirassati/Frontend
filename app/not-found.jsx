"use client"
  export default function error(){
    console.log(localStorage.removeItem("persist:auth"))
    console.log(localStorage.getItem("persist:auth"))

  return(
    <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", height:"100vh"}}>
      <img src={"./error.svg"} style={{width:"500px"}}/>
    </div>
  )
}