import { Component, OnInit, model } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { CustomerService } from '../../service/customer.service';
import { CookieService } from 'ngx-cookie-service';
import { exhibit, workAdvance, WorkProgress } from '../../../interfaces/models';
import { Router } from '@angular/router';

interface imageItem {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
  tittle: string
}

@Component({
  selector: 'app-advances',
  templateUrl:'./advances.component.html',
  styleUrl: './advances.component.css',
  standalone: true,
  imports: [GalleriaModule, ButtonModule]
})
export class AdvancesComponent implements OnInit{

  images: imageItem[];
  work_advances: workAdvance[] | null = null;
  work_progres: WorkProgress | null = null;
  exhibits: exhibit[] | null = null;

    responsiveOptions: any[] = [
        {
            breakpoint: '1300px',
            numVisible: 4
        },
        {
            breakpoint: '500px',
            numVisible: 1
        }
    ];

    constructor(
      private customService: CustomerService,
      private cookiesService: CookieService,
      private router: Router
    ) {
      this.images = []
    }
  ngOnInit(): void {
    this.fetchAdvances();
  }

    fetchAdvances(){
      this.customService.getWorkProgress(this.cookiesService.get('id')).subscribe({
        next: (response) => {
          this.work_progres = response;
          this.work_advances = this.work_progres?.work_advance ?? null;
        }, error: (err) =>{
          console.error('Error fetching work progress:', err);
          }
      })
    }

  getFormattedImages(exhibits: exhibit[]): any[] {
  const allImages: any[] = [];
  
  exhibits.forEach(exhibit => {
    exhibit.images.forEach(imageUrl => {
      allImages.push({
        itemImageSrc: imageUrl,
        thumbnailImageSrc: imageUrl,
        alt:'imagen',
        tittle: 'imagen'
      });
    });
  });
  
  return allImages;
}

  backtohome(){
    this.router.navigate(['home-customer']).then(() =>{});
  }

}
