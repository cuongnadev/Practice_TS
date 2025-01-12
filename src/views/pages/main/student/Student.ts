import { StudentController } from "../../../../controllers";
import { Pagination } from "../../../components";
import { Input, Search, TextArea } from "../../../components/common";
import { CreateElement, PageLayout } from "../../../components/core";

const TitlesList = [
    "Name",
    "ID",
    "Date",
    "Parent Name",
    "City",
    "Contact",
    "Grade",
    "Action",
];

class Students extends PageLayout<StudentController> {
    startItem: number = 0;
    studentPerPage: number = 8;
    listStudent!: HTMLTableElement;
    studentLists!: HTMLDivElement;
    studentListHeader!: HTMLTableSectionElement;
    studentListBody!: HTMLTableSectionElement;
    pagination!: Pagination;
    toolbar!: HTMLDivElement;

    constructor() {
        super('students_container d-flex flex-col gap-4', new StudentController());
        this.container.setAttribute('name', 'Student');
        
        this.initData();
    }

    initData(): void {
        super.initData();
        this.controller?.fetchData(this.initContent.bind(this));
    }

    protected initContent(): void {
        // toolbar
        const searchComponent = new Search();

        // Lắng nghe sự kiện 'search'
        searchComponent.eventEmitter.on('search', (value: string) => this.updateListStudents(undefined, value));

        this.toolbar = CreateElement('div', '', [
            searchComponent.render(),
        ]);

        // header table
        const checkBoxInput = CreateElement("input", "students_checkbox all");
        checkBoxInput.type = "checkbox";
        const checkbox = CreateElement('th', '', [checkBoxInput]);
        this.studentListHeader = CreateElement('thead', '', [checkbox]);
        TitlesList.forEach((title) => {
            const th = CreateElement('th', '', [title]);
            this.studentListHeader.appendChild(th);
        });

        // body table
        this.studentListBody = CreateElement('tbody');
        this.controller?.handleStudentLists(this.studentListBody, this.startItem, this.studentPerPage);

        // table
        this.listStudent = CreateElement('table', 'students_table', [this.studentListHeader, this.studentListBody]);

        // pagination
        this.studentLists = CreateElement('div', 'students_list d-flex flex-col', [this.listStudent]);
        this.initPagination();

        this.container.append(this.toolbar, this.studentLists);
    }

    private initPagination(): void {
        this.handleTotalStudents().then((totalStudents) => {
            this.pagination = new Pagination(this.startItem, this.studentPerPage, totalStudents);
            this.pagination.handlePageChange = (currentItem: number) => this.updateListStudents(currentItem);
    
            // Thêm Pagination vào `studentLists` sau khi có dữ liệu
            this.studentLists.appendChild(this.pagination.render());
        });
    }
    
    private async handleTotalStudents(): Promise<number> {
        const students = await this.controller?.getStudentList();
        return students ? students.length : 0;
    }

    updateListStudents(currentItem?: number, value?: string) {
        this.studentListBody.innerHTML = "";
        if(currentItem !== undefined) {
            this.controller?.handleStudentLists(this.studentListBody, currentItem, this.studentPerPage);
        } else if (value?.trim()) {
            this.controller?.handleStudentLists(this.studentListBody, currentItem!, this.studentPerPage, value);
            this.studentLists.removeChild(this.pagination.render());
        } else {
            this.controller?.handleStudentLists(this.studentListBody, 0, 8)
            this.studentLists.appendChild(this.pagination.render());
        }
    }

    render() {
        return this.container;
    }
}

export default Students;