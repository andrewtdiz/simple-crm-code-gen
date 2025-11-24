
function CodeTask(query: string) -> string {
  client CerebrasOss
  prompt #"
    Complete the user's request using this API:

    ```typescript
    type ContactData = {
      name: string;
      email: string;
      company: string;
      status: "lead" | "prospect" | "customer";
    };

    type Contact = ContactData & { id: string; createdAt: Date };
    type ContactUpdate = Partial<ContactData>;

    function getContact(id: string): Contact | null;
    function createContact(contact: ContactData): Contact;
    function updateContact(id: string, updates: ContactUpdate): Contact | null;
    ```

    Write the body of the `executeCommand` function in the following .ts file.
    Be concise, no comments or console logging.
    Return true if the command was successful, false otherwise.
    Do NOT rewrite the entire file, only the function body:

    ```typescript
    import { getContact, createContact, updateContact } from "./sheets";

    function executeCommand(): boolean {
      // TODO: implement the user's request here
    }
    ```

    Current users:
    id | name | email | company | status | createdAt
    1 | John Doe | john.doe@example.com | Example Inc | lead | 2021-01-01
    2 | Jane Smith | jane.smith@example.com | Example Inc | prospect | 2021-01-02
    3 | Jim Beam | jim.beam@example.com | Example Inc | customer | 2021-01-03

    {{ ctx.output_format }}

    {{ _.role("user") }}
    {{ query }}
  "#
}

test test_operation_simple {
  functions [CodeTask]
  args {
    query "Set user id 2 status to prospect"
  }
}