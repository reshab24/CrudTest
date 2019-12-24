import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IndexedDbService } from 'src/app/services/indexeddb.service';
import { Router, ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  form:FormGroup;
  hide=true;
  private _dbName = 'crud';
  private _storeName = 'registration';
  key: any;

  constructor(private _FB:FormBuilder,private idb: IndexedDbService, private router: Router, private activatedRoute:ActivatedRoute) {
    idb.setName(this._dbName);
    idb.initializeObjectStores([this._storeName]);
   }

  ngOnInit() {
    this.form=this._FB.group({
      firstName:['',Validators.required],
      lastName:['',Validators.required],
      password:['',Validators.required],
      email:['',[Validators.required,Validators.email]],
      contactNumber:['',[Validators.required,Validators.pattern('[6-9]\\d{9}')]]
    })   
    this.activatedRoute.params.subscribe(params => {
      this.key=params['id'];
      if (this.key){
        this.idb.get(this._storeName,this.key).then(res=>
        {
        this.form.setValue(res);
        });
      }
    });
  }
  //save/update data
  save():void{
    console.log(this.form.invalid);
    if(!this.form.invalid){
      const key=this.key?this.key:new Date().getTime().toString();
      this.idb.put(this._storeName, key, this.form.value).then(res=>this.router.navigate(['home']));
    }
  }
}
