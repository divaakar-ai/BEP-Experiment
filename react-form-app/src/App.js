// App.jsx
// Single-file React component for a custom application with full form handling.
// How to use:
// 1. Create a React app (Vite or Create React App).
// 2. Replace the contents of src/App.jsx with this file and ensure tailwind is configured
//    (Tailwind is optional; classes will still work as plain classNames but look best with Tailwind).
// 3. Run the app with `npm start` or `npm run dev`.

import React, { useState, useEffect } from "react";

export default function App() {
  // form state (controlled inputs)
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    bio: "",
    hobbies: [],
    agree: false,
    profile: null, // File object
  });

  // for image preview
  const [preview, setPreview] = useState(null);
  // form errors
  const [errors, setErrors] = useState({});
  // saved submissions
  const [submissions, setSubmissions] = useState([]);

  // load submissions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("react_form_submissions");
    if (saved) setSubmissions(JSON.parse(saved));
  }, []);

  // update preview when profile file changes
  useEffect(() => {
    if (!form.profile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(form.profile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.profile]);

  // helper: update form fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "hobbies") {
      // hobbies is an array of strings
      const next = checked
        ? [...form.hobbies, value]
        : form.hobbies.filter((h) => h !== value);
      setForm((f) => ({ ...f, hobbies: next }));
      return;
    }

    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  // file input handler
  const handleFile = (e) => {
    const file = e.target.files[0] || null;
    setForm((f) => ({ ...f, profile: file }));
  };

  // simple validation
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.age && (isNaN(Number(form.age)) || Number(form.age) <= 0)) e.age = "Enter a valid age.";
    if (!form.gender) e.gender = "Please select your gender.";
    if (!form.agree) e.agree = "You must agree to the terms.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    // Prepare submission object. We can't store File in localStorage, so convert image to data URL (optional)
    if (form.profile) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        saveSubmission({ ...form, profileUrl: dataUrl });
      };
      reader.readAsDataURL(form.profile);
    } else {
      saveSubmission({ ...form, profileUrl: null });
    }
  };

  const saveSubmission = (submitted) => {
    // remove actual File object before saving (already encoded as profileUrl)
    const toSave = {
      name: submitted.name,
      email: submitted.email,
      age: submitted.age,
      gender: submitted.gender,
      bio: submitted.bio,
      hobbies: submitted.hobbies,
      profileUrl: submitted.profileUrl,
      timestamp: new Date().toISOString(),
    };

    const next = [toSave, ...submissions];
    setSubmissions(next);
    localStorage.setItem("react_form_submissions", JSON.stringify(next));

    // reset form (but keep submissions)
    setForm({ name: "", email: "", age: "", gender: "", bio: "", hobbies: [], agree: false, profile: null });
    setPreview(null);
    setErrors({});
  };

  const handleDelete = (ts) => {
    const next = submissions.filter((s) => s.timestamp !== ts);
    setSubmissions(next);
    localStorage.setItem("react_form_submissions", JSON.stringify(next));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Custom React Form — Example</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="mt-1 block w-full rounded-md border p-2"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-md border p-2"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Age</label>
              <input
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="e.g. 23"
                className="mt-1 block w-full rounded-md border p-2"
              />
              {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Gender</label>
              <div className="flex gap-4 mt-1">
                {["male", "female", "other"].map((g) => (
                  <label key={g} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={handleChange}
                    />
                    <span className="capitalize">{g}</span>
                  </label>
                ))}
              </div>
              {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Short bio..."
              rows={3}
              className="mt-1 block w-full rounded-md border p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Hobbies</label>
            <div className="flex gap-4 mt-1">
              {["coding", "reading", "music", "sports"].map((h) => (
                <label key={h} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="hobbies"
                    value={h}
                    checked={form.hobbies.includes(h)}
                    onChange={handleChange}
                  />
                  <span className="capitalize">{h}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium">Profile Image (optional)</label>
              <input type="file" accept="image/*" onChange={handleFile} className="mt-1" />
            </div>
            <div>
              {preview ? (
                <img src={preview} alt="preview" className="h-20 w-20 object-cover rounded-md border" />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center border rounded-md text-sm text-gray-500">No image</div>
              )}
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
              <span>I agree to the terms</span>
            </label>
            {errors.agree && <p className="text-red-600 text-sm mt-1">{errors.agree}</p>}
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Submit</button>
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() => {
                setForm({ name: "", email: "", age: "", gender: "", bio: "", hobbies: [], agree: false, profile: null });
                setPreview(null);
                setErrors({});
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {/* Submissions list */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Saved Submissions</h2>
          {submissions.length === 0 ? (
            <p className="text-gray-600">No submissions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Age</th>
                    <th className="p-2 text-left">Gender</th>
                    <th className="p-2 text-left">Hobbies</th>
                    <th className="p-2 text-left">Profile</th>
                    <th className="p-2 text-left">When</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.timestamp} className="border-t">
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">{s.email}</td>
                      <td className="p-2">{s.age}</td>
                      <td className="p-2 capitalize">{s.gender}</td>
                      <td className="p-2">{s.hobbies?.join(", ")}</td>
                      <td className="p-2">
                        {s.profileUrl ? (
                          <img src={s.profileUrl} alt="profile" className="h-12 w-12 object-cover rounded-md" />
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="p-2 text-sm">{new Date(s.timestamp).toLocaleString()}</td>
                      <td className="p-2">
                        <button className="px-2 py-1 border rounded mr-2" onClick={() => navigator.clipboard?.writeText(JSON.stringify(s))}>
                          Copy
                        </button>
                        <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleDelete(s.timestamp)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
