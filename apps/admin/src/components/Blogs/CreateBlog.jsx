import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Switch,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import {
  IconArrowLeft,
  IconBold,
  IconDeviceFloppy,
  IconEye,
  IconH1,
  IconH2,
  IconH3,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconPlus,
  IconQuote,
  IconStrikethrough,
  IconUnderline,
} from "@tabler/icons-react";
import {
  AdminCard,
  AdminStack,
  PrimaryButton,
  adminUi,
} from "components/AdminUI/AdminPage";
import { useCreateBlog, useSingleBlog, useUpdateBlog } from "hooks/useBlog";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const makeSlug = (title) =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

function Field({ label, children, error }) {
  return (
    <FormControl isInvalid={!!error}>
      <Text fontSize="18px" color={adminUi.text} mb="10px">
        {label}
      </Text>
      {children}
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}

function ToolbarButton({ icon, label, active }) {
  return (
    <IconButton
      aria-label={label}
      icon={<Icon as={icon} boxSize="18px" />}
      size="sm"
      variant="ghost"
      borderRadius="8px"
      bg={active ? "#F0F2F6" : "transparent"}
      color={active ? adminUi.text : "#596B86"}
    />
  );
}

const CreateBlog = () => {
  const { id } = useParams();
  const toast = useToast();
  const history = useHistory();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    tags: "Shipping Tips",
    author: "Arjun Patel",
    read_time: "",
    accent_color: "#6C5CE7",
    status: "draft",
    is_featured: false,
    content: "",
    meta_title: "",
    meta_description: "",
    og_image: "",
  });
  const [errors, setErrors] = useState({});
  const createBlogMutation = useCreateBlog();
  const updateBlogMutation = useUpdateBlog();
  const { data: blogData, isLoading } = useSingleBlog(id);
  const blog = blogData?.data;

  useEffect(() => {
    if (!blog) return;
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      tags: blog.tags || "Shipping Tips",
      author: blog.author || "Arjun Patel",
      read_time: blog.read_time || "",
      accent_color: blog.accent_color || "#6C5CE7",
      status: blog.status || "draft",
      is_featured: Boolean(blog.is_featured),
      content: blog.content || "",
      meta_title: blog.meta_title || "",
      meta_description: blog.meta_description || blog.excerpt || "",
      og_image: blog.og_image || "",
    });
  }, [blog]);

  useEffect(() => {
    if (!id && form.title) {
      setForm((previous) => ({ ...previous, slug: makeSlug(form.title) }));
    }
  }, [form.title, id]);

  const updateForm = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const validateForm = (status) => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.slug.trim()) nextErrors.slug = "Slug is required";
    if (status !== "draft" && !form.excerpt.trim())
      nextErrors.excerpt = "Excerpt is required";
    if (status !== "draft" && !form.content.trim())
      nextErrors.content = "Content is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (status = "published") => {
    if (!validateForm(status)) {
      toast({
        title: "Please fill in required fields",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const payload = {
      ...form,
      tags: form.tags,
      status,
      published_at:
        status === "published" ? new Date().toISOString() : form.published_at,
      meta_description: form.meta_description,
    };

    try {
      if (id) {
        await updateBlogMutation.mutateAsync({ id, data: payload });
      } else {
        await createBlogMutation.mutateAsync(payload);
      }

      toast({
        title: status === "draft" ? "Draft saved" : "Blog published",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      history.push("/admin/blogs");
    } catch (error) {
      toast({
        title: `Error ${id ? "updating" : "creating"} blog`,
        description: error?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Flex
        pt={{ base: "120px", md: "75px" }}
        justify="center"
        align="center"
        minH="60vh"
      >
        <Spinner size="xl" color="purple.500" />
      </Flex>
    );
  }

  return (
    <AdminStack spacing="20px">
      <AdminCard px="26px" py="20px">
        <Flex justify="space-between" align="center" gap="16px" wrap="wrap">
          <HStack spacing="14px">
            <IconButton
              aria-label="Back"
              icon={<IconArrowLeft size={21} />}
              variant="outline"
              bg="#FFFFFF"
              borderColor="#D6DEE9"
              borderRadius="9px"
              onClick={() => history.push("/admin/blogs")}
            />
            <Text fontSize="26px" fontWeight="800" color={adminUi.text}>
              {id ? "Edit Blog Post" : "New Blog Post"}
            </Text>
          </HStack>
          <HStack spacing="10px">
            <Button
              leftIcon={<IconDeviceFloppy size={18} />}
              variant="outline"
              h="50px"
              px="20px"
              borderColor="#D6DEE9"
              borderRadius="9px"
              fontSize="18px"
              bg="#FFFFFF"
              isLoading={
                createBlogMutation.isLoading || updateBlogMutation.isLoading
              }
              onClick={() => handleSubmit("draft")}
            >
              Save Draft
            </Button>
            <PrimaryButton
              leftIcon={<IconEye size={18} />}
              isLoading={
                createBlogMutation.isLoading || updateBlogMutation.isLoading
              }
              onClick={() => handleSubmit("published")}
            >
              Publish
            </PrimaryButton>
          </HStack>
        </Flex>
      </AdminCard>

      <SimpleGrid
        columns={{ base: 1, xl: 2 }}
        templateColumns={{ xl: "2fr 1fr" }}
        spacing="20px"
      >
        <VStack spacing="20px" align="stretch">
          <AdminCard p="26px">
            <VStack spacing="26px" align="stretch">
              <Field label="Title" error={errors.title}>
                <Input
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="10 Strategies to Reduce RTO"
                  h="49px"
                  fontSize="18px"
                  borderColor="#D6DEE9"
                  _placeholder={{ color: "#B5BBC5" }}
                />
              </Field>
              <Field label="Slug (optional)" error={errors.slug}>
                <Input
                  value={form.slug}
                  onChange={(event) => updateForm("slug", event.target.value)}
                  placeholder="reduce-rto-strategies"
                  h="39px"
                  fontSize="18px"
                  borderColor="#D6DEE9"
                  _placeholder={{ color: "#B5BBC5" }}
                />
              </Field>
              <Field label="Excerpt" error={errors.excerpt}>
                <Textarea
                  value={form.excerpt}
                  onChange={(event) =>
                    updateForm("excerpt", event.target.value)
                  }
                  placeholder="A short summary of what this post is about..."
                  minH="94px"
                  fontSize="18px"
                  borderColor="#D6DEE9"
                  resize="vertical"
                  _placeholder={{ color: "#B5BBC5" }}
                />
                <Text
                  textAlign="right"
                  color="#8C94A3"
                  fontSize="18px"
                  mt="2px"
                >
                  {form.excerpt.length} / 500
                </Text>
              </Field>
            </VStack>
          </AdminCard>

          <AdminCard overflow="hidden">
            <Box p="26px" pb="12px">
              <Text fontSize="16px" fontWeight="700" color={adminUi.text}>
                Content *
              </Text>
            </Box>
            <Flex
              px="20px"
              py="11px"
              gap="8px"
              align="center"
              borderTop="1px solid"
              borderBottom="1px solid"
              borderColor={adminUi.border}
              bg="#FAFBFE"
              wrap="wrap"
            >
              <ToolbarButton icon={IconArrowLeft} label="Undo" />
              <ToolbarButton icon={IconArrowLeft} label="Redo" />
              <Box h="24px" w="1px" bg={adminUi.border} />
              <ToolbarButton icon={IconBold} label="Bold" />
              <ToolbarButton icon={IconItalic} label="Italic" />
              <ToolbarButton icon={IconUnderline} label="Underline" />
              <ToolbarButton icon={IconStrikethrough} label="Strike" />
              <ToolbarButton icon={IconH1} label="Heading 1" active />
              <ToolbarButton icon={IconH2} label="Heading 2" />
              <ToolbarButton icon={IconH3} label="Heading 3" />
              <ToolbarButton icon={IconList} label="List" />
              <ToolbarButton icon={IconListNumbers} label="Numbered list" />
              <ToolbarButton icon={IconQuote} label="Quote" />
              <ToolbarButton icon={IconLink} label="Link" />
              <ToolbarButton icon={IconPhoto} label="Image" />
            </Flex>
            <Textarea
              value={form.content}
              onChange={(event) => updateForm("content", event.target.value)}
              placeholder="Start writing your post here..."
              minH="270px"
              border="0"
              borderRadius="0"
              px="22px"
              py="48px"
              fontSize="22px"
              color={adminUi.text}
              resize="vertical"
              _placeholder={{ color: "#607397" }}
              _focus={{ boxShadow: "none" }}
            />
            {errors.content ? (
              <Text color="red.500" px="22px" pb="16px">
                {errors.content}
              </Text>
            ) : null}
          </AdminCard>

          <AdminCard p="26px">
            <Text
              fontSize="20px"
              fontWeight="800"
              color={adminUi.text}
              mb="18px"
            >
              SEO
            </Text>
            <VStack spacing="26px" align="stretch">
              <Field label="SEO Title ? (optional)">
                <Input
                  value={form.meta_title}
                  onChange={(event) =>
                    updateForm("meta_title", event.target.value)
                  }
                  h="40px"
                  borderColor="#D6DEE9"
                />
                <Text
                  textAlign="right"
                  color="#8C94A3"
                  fontSize="18px"
                  mt="-25px"
                  pr="12px"
                >
                  {form.meta_title.length} / 200
                </Text>
              </Field>
              <Field label="SEO Description ? (optional)">
                <Textarea
                  value={form.meta_description}
                  onChange={(event) =>
                    updateForm("meta_description", event.target.value)
                  }
                  minH="93px"
                  borderColor="#D6DEE9"
                />
                <Text
                  textAlign="right"
                  color="#8C94A3"
                  fontSize="18px"
                  mt="2px"
                >
                  {form.meta_description.length} / 500
                </Text>
              </Field>
            </VStack>
          </AdminCard>
        </VStack>

        <VStack spacing="20px" align="stretch">
          <AdminCard p="25px">
            <Text
              fontSize="20px"
              fontWeight="800"
              color={adminUi.text}
              mb="16px"
            >
              Cover Image
            </Text>
            <Flex
              h="252px"
              align="center"
              justify="center"
              direction="column"
              border="1px dashed"
              borderColor={adminUi.border}
              borderRadius="14px"
              bg="#FAFBFE"
              color={adminUi.muted}
            >
              <Icon as={IconPhoto} boxSize="40px" strokeWidth={1.7} />
              <Text fontSize="16px" mt="12px">
                No cover image
              </Text>
            </Flex>
            <Button
              leftIcon={<IconPhoto size={18} />}
              variant="outline"
              mt="16px"
              h="50px"
              borderColor="#D6DEE9"
              borderRadius="9px"
              bg="#FFFFFF"
              fontSize="18px"
            >
              Upload Image
            </Button>
            <Text fontSize="15px" color={adminUi.muted} mt="12px">
              JPEG, PNG or WebP. Max 5MB. Recommended 1200x630.
            </Text>
          </AdminCard>

          <AdminCard p="25px">
            <VStack spacing="24px" align="stretch">
              <Field label="Category">
                <Select
                  value={form.tags}
                  onChange={(event) => updateForm("tags", event.target.value)}
                  h="40px"
                  borderColor="#D6DEE9"
                  fontSize="17px"
                >
                  <option value="Shipping Tips">Shipping Tips</option>
                  <option value="Ecommerce">Ecommerce</option>
                  <option value="Courier">Courier</option>
                </Select>
              </Field>
              <Field label="Author">
                <Input
                  value={form.author}
                  onChange={(event) => updateForm("author", event.target.value)}
                  placeholder="Arjun Patel"
                  h="40px"
                  borderColor="#D6DEE9"
                  fontSize="17px"
                />
              </Field>
              <Field label="Read Time ? (optional)">
                <Input
                  value={form.read_time}
                  onChange={(event) =>
                    updateForm("read_time", event.target.value)
                  }
                  placeholder="5 min read"
                  h="40px"
                  borderColor="#D6DEE9"
                  fontSize="17px"
                />
              </Field>
              <Field label="Accent Color ? (optional)">
                <HStack
                  w="138px"
                  h="40px"
                  px="6px"
                  border="1px solid"
                  borderColor="#D6DEE9"
                  borderRadius="9px"
                >
                  <Box
                    w="29px"
                    h="29px"
                    borderRadius="7px"
                    bg={form.accent_color}
                  />
                  <Input
                    value={form.accent_color}
                    onChange={(event) =>
                      updateForm("accent_color", event.target.value)
                    }
                    border="0"
                    p="0"
                    fontSize="17px"
                    _focus={{ boxShadow: "none" }}
                  />
                </HStack>
              </Field>
            </VStack>
          </AdminCard>

          <AdminCard p="25px">
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value)}
                h="40px"
                borderColor="#D6DEE9"
                fontSize="17px"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
            <Flex justify="space-between" align="center" mt="18px">
              <Text fontSize="20px" color={adminUi.text}>
                Featured ? (optional)
              </Text>
              <Switch
                colorScheme="purple"
                isChecked={form.is_featured}
                onChange={(event) =>
                  updateForm("is_featured", event.target.checked)
                }
              />
            </Flex>
          </AdminCard>
        </VStack>
      </SimpleGrid>
    </AdminStack>
  );
};

export default CreateBlog;
