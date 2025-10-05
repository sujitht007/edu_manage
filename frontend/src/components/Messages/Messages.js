import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  PaperAirplaneIcon,
  InboxIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');
  const [composeForm, setComposeForm] = useState({
    receiverId: '',
    subject: '',
    content: '',
    priority: 'normal'
  });

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'inbox' ? '/api/messages/inbox' : '/api/messages/sent';
      const response = await axios.get(endpoint);
      setMessages(response.data.messages || response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get('/api/messages/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, [activeTab, fetchMessages, fetchUsers]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/messages', composeForm);
      toast.success('Message sent successfully!');
      setShowCompose(false);
      setComposeForm({ receiverId: '', subject: '', content: '', priority: 'normal' });
      if (activeTab === 'sent') {
        fetchMessages();
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`/api/messages/${messageId}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="mt-2 text-gray-600">Communicate with students and instructors</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="btn btn-primary flex items-center"
        >
          <PencilIcon className="h-5 w-5 mr-2" />
          Compose
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inbox'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <InboxIcon className="h-5 w-5 inline mr-2" />
            Inbox
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sent'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5 inline mr-2" />
            Sent
          </button>
        </nav>
      </div>

      {/* Messages List */}
      <div className="card">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <InboxIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages</h3>
            <p className="text-gray-600">Start a conversation by composing a new message</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message._id}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.isRead && activeTab === 'inbox') {
                    markAsRead(message._id);
                  }
                }}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  !message.isRead && activeTab === 'inbox' ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="font-medium text-gray-900">
                        {activeTab === 'inbox' 
                          ? `${message.sender?.firstName} ${message.sender?.lastName}`
                          : `${message.receiver?.firstName} ${message.receiver?.lastName}`
                        }
                      </p>
                      <span className="text-xs text-gray-500 capitalize">
                        {activeTab === 'inbox' ? message.sender?.role : message.receiver?.role}
                      </span>
                      {!message.isRead && activeTab === 'inbox' && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-1">{message.subject}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {formatDate(message.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Compose Message</h3>
            
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <select
                  value={composeForm.receiverId}
                  onChange={(e) => setComposeForm({ ...composeForm, receiverId: e.target.value })}
                  required
                  className="input"
                >
                  <option value="">Select recipient</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  rows={6}
                  value={composeForm.content}
                  onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedMessage.subject}</h3>
                <p className="text-sm text-gray-600">
                  {activeTab === 'inbox' ? 'From' : 'To'}: {' '}
                  {activeTab === 'inbox' 
                    ? `${selectedMessage.sender?.firstName} ${selectedMessage.sender?.lastName}`
                    : `${selectedMessage.receiver?.firstName} ${selectedMessage.receiver?.lastName}`
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(selectedMessage.createdAt, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="border-t pt-4">
              <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
