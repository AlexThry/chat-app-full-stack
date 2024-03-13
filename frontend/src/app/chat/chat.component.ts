import {ChangeDetectorRef, Component, ElementRef, Input} from "@angular/core";
import { Message } from "../models/message.model";
import { User } from "../models/user.model";
import { UserService } from "../services/user.service";
import { MessageService } from "../services/message.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {CommonModule, DatePipe, Location, NgClass, NgStyle} from "@angular/common";
import { FormsModule, NgForm, ReactiveFormsModule } from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {filter} from "rxjs";
import { io } from "socket.io-client";
import {data} from "autoprefixer";


@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule,DatePipe, NgStyle, FormsModule, ReactiveFormsModule, NgClass],
  templateUrl: "./chat.component.html",
  styleUrl: "./chat.component.scss",
})
export class ChatComponent {
    messages : Message[] = [];
    correspondantId !: string;
    loggedUserId !: string;
    loaded : number = 100;
    correspondant !: User ;
    dataLoaded : boolean = false;


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        protected messageService: MessageService,
        protected authService: AuthService,
        protected userService: UserService,
        private cdr: ChangeDetectorRef,
        private elementRef: ElementRef,
    ) {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            // Rechargez le composant ici
            this.loadData();
        });
    }




    ngOnInit() {
        this.loadData();
        console.log(this.dataLoaded)
    }

    loadData() {
        this.messages = []
        this.correspondantId = this.route.snapshot.params["id"];
        this.loggedUserId = localStorage.getItem("user_id")!;
        this.userService.getUserById(this.correspondantId).subscribe(user => {
            this.correspondant = user;
            this.messageService.getMessagesFromUsersIdsFromLimit(this.correspondantId, this.loggedUserId, 0, this.loaded).subscribe(messages => {
                this.messages = messages.reverse();
            })
            this.dataLoaded = true;
        })

        this.cdr.detectChanges();
    }

    onSubmitMessage(f: NgForm) {
        if (f.value.message != "" && f.value.message != undefined) {
            this.messageService
                .createMessage(
                    this.loggedUserId,
                    this.correspondantId,
                    f.value.message,
                )
                .subscribe(() => {
                    const newMessage = new Message(0, f.value.message, this.loggedUserId, this.correspondantId, new Date())
                    this.messages.push(newMessage)
                    f.controls["message"].reset();
                });
        }
    }

    chatIsLoaded() {
        return this.dataLoaded
    }

    protected readonly Date = Date;
    protected readonly DatePipe = DatePipe;
}
