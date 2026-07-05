import { Button, HStack, Icon, IconButton, Text } from "@chakra-ui/react";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  AdminCard,
  AdminSelect,
  AdminStack,
  DataTable,
  PrimaryButton,
  SearchInput,
  SoftBadge,
  adminUi,
} from "components/AdminUI/AdminPage";
import { useBlogs } from "hooks/useBlog";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const fallbackBlog = {
  id: "sample-blog",
  title: "10 Proven Strategies to Reduce RTO and Save Lakhs on Shipping",
  slug: "/10-proven-strategies-to-reduce-rto-and-save-lakhs-on-shipping",
  category: "Shipping Tips",
  author: "Arjun Patel",
  status: "published",
  updated: "9/4/2026",
};

const Blogs = () => {
  const history = useHistory();
  const [page] = useState(1);
  const [perPage] = useState(10);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  const { data, isLoading } = useBlogs({
    page,
    perPage,
    search: filters.search,
    status: filters.status,
  });

  const rows = useMemo(() => {
    const blogRows = data?.data || [];
    if (!blogRows.length) return [fallbackBlog];

    return blogRows.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug?.startsWith("/") ? blog.slug : `/${blog.slug || ""}`,
      category:
        blog.category || blog.tags?.split?.(",")?.[0] || "Shipping Tips",
      author: blog.author || "Arjun Patel",
      status: blog.status || (blog.published_at ? "published" : "draft"),
      updated: blog.updated_at
        ? new Date(blog.updated_at).toLocaleDateString("en-IN")
        : blog.published_at
        ? new Date(blog.published_at).toLocaleDateString("en-IN")
        : "9/4/2026",
    }));
  }, [data]);

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (_value, row) => (
        <>
          <Text fontSize="18px" fontWeight="700" color={adminUi.text}>
            {row.title}
          </Text>
          <Text fontSize="17px" color={adminUi.muted} mt="4px">
            {row.slug}
          </Text>
        </>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value) => (
        <SoftBadge
          colorScheme="gray"
          bg="#FFFFFF"
          border="1px solid #D6DEE9"
          color={adminUi.muted}
        >
          {value}
        </SoftBadge>
      ),
    },
    { key: "author", label: "Author" },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <SoftBadge
          colorScheme="green"
          color="#28A600"
          bg="#F1FFE9"
          border="1px solid #A8E283"
        >
          {value}
        </SoftBadge>
      ),
    },
    { key: "updated", label: "Updated" },
  ];

  return (
    <AdminStack spacing="20px">
      <AdminCard p="25px">
        <HStack
          justify="space-between"
          align="center"
          mb="20px"
          wrap="wrap"
          gap="16px"
        >
          <Text fontSize="26px" fontWeight="800" color={adminUi.text}>
            Blog Posts
          </Text>
          <PrimaryButton
            leftIcon={<Icon as={IconPlus} />}
            onClick={() => history.push("/admin/create-blog")}
          >
            New Post
          </PrimaryButton>
        </HStack>

        <HStack spacing="10px" mb="20px" wrap="wrap">
          <SearchInput
            value={filters.search}
            onChange={(value) =>
              setFilters((previous) => ({ ...previous, search: value }))
            }
            placeholder="Search by title, slug or author"
            maxW="482px"
          />
          <AdminSelect
            value={filters.status}
            onChange={(value) =>
              setFilters((previous) => ({ ...previous, status: value }))
            }
            maxW="200px"
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </AdminSelect>
        </HStack>

        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading && !rows.length}
          rowKey="id"
          minW="1040px"
          actions={(row) => (
            <HStack spacing="12px" justify="flex-end">
              <IconButton
                aria-label="Edit blog"
                icon={<IconEdit size={18} />}
                size="sm"
                variant="outline"
                borderColor="#D6DEE9"
                bg="#FFFFFF"
                onClick={() => history.push(`/admin/create-blog/${row.id}`)}
              />
              <IconButton
                aria-label="Delete blog"
                icon={<IconTrash size={18} />}
                size="sm"
                variant="outline"
                color="#FF3D3D"
                borderColor="#FFB5B5"
                bg="#FFFFFF"
              />
            </HStack>
          )}
        />
      </AdminCard>
    </AdminStack>
  );
};

export default Blogs;
