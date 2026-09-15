import PageHeader from "@/components/PageHeader";
import AddCustomerForm from "@/components/AddCustomerForm";

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader title="Add Customer" backHref="/customers" />
      <AddCustomerForm />
    </div>
  );
}
